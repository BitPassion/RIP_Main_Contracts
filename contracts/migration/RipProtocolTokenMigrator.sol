// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IsRIP.sol";
import "../interfaces/IwsRIP.sol";
import "../interfaces/IgRIP.sol";
import "../interfaces/ITreasury.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/IOwnable.sol";
import "../interfaces/IPancakeV2Router.sol";
import "../interfaces/IStakingV1.sol";
import "../interfaces/ITreasuryV1.sol";

import "../types/RipProtocolAccessControlled.sol";

import "../libraries/SafeMath.sol";
import "../libraries/SafeERC20.sol";

contract RipProtocolTokenMigrator is RipProtocolAccessControlled {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IgRIP;
    using SafeERC20 for IsRIP;
    using SafeERC20 for IwsRIP;

    /* ========== MIGRATION ========== */

    event TimelockStarted(uint256 block, uint256 end);
    event Migrated(address staking, address treasury);
    event Funded(uint256 amount);
    event Defunded(uint256 amount);

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable oldRIP;
    IsRIP public immutable oldsRIP;
    IwsRIP public immutable oldwsRIP;
    ITreasuryV1 public immutable oldTreasury;
    IStakingV1 public immutable oldStaking;

    IPancakeV2Router public immutable ApeRouter;
    IPancakeV2Router public immutable pancakeRouter;

    IgRIP public gRIP;
    ITreasury public newTreasury;
    IStaking public newStaking;
    IERC20 public newRIP;

    bool public ripMigrated;
    bool public shutdown;

    uint256 public immutable timelockLength;
    uint256 public timelockEnd;

    uint256 public oldSupply;

    constructor(
        address _oldRIP,
        address _oldsRIP,
        address _oldTreasury,
        address _oldStaking,
        address _oldwsRIP,
        address _ape,
        address _pancake,
        uint256 _timelock,
        address _authority
    ) RipProtocolAccessControlled(IRipProtocolAuthority(_authority)) {
        require(_oldRIP != address(0), "Zero address: RIP");
        oldRIP = IERC20(_oldRIP);
        require(_oldsRIP != address(0), "Zero address: sR.RIP");
        oldsRIP = IsRIP(_oldsRIP);
        require(_oldTreasury != address(0), "Zero address: Treasury");
        oldTreasury = ITreasuryV1(_oldTreasury);
        require(_oldStaking != address(0), "Zero address: Staking");
        oldStaking = IStakingV1(_oldStaking);
        require(_oldwsRIP != address(0), "Zero address: wsR.RIP");
        oldwsRIP = IwsRIP(_oldwsRIP);
        require(_ape != address(0), "Zero address: ape");
        ApeRouter = IPancakeV2Router(_ape);
        require(_pancake != address(0), "Zero address: Pancake");
        pancakeRouter = IPancakeV2Router(_pancake);
        timelockLength = _timelock;
    }

    /* ========== MIGRATION ========== */

    enum TYPE {
        UNSTAKED,
        STAKED,
        WRAPPED
    }

    // migrate RIPv1, sRIPv1, or wsRIP for RIPv2, sRIPv2, or gRIP
    function migrate(
        uint256 _amount,
        TYPE _from,
        TYPE _to
    ) external {
        require(!shutdown, "Shut down");

        uint256 wAmount = oldwsRIP.sRIPTowRIP(_amount);

        if (_from == TYPE.UNSTAKED) {
            require(ripMigrated, "Only staked until migration");
            oldRIP.safeTransferFrom(msg.sender, address(this), _amount);
        } else if (_from == TYPE.STAKED) {
            oldsRIP.safeTransferFrom(msg.sender, address(this), _amount);
        } else {
            oldwsRIP.safeTransferFrom(msg.sender, address(this), _amount);
            wAmount = _amount;
        }

        if (ripMigrated) {
            require(oldSupply >= oldRIP.totalSupply(), "RIPv1 minted");
            _send(wAmount, _to);
        } else {
            gRIP.mint(msg.sender, wAmount);
        }
    }

    // migrate all ripProtocol tokens held
    function migrateAll(TYPE _to) external {
        require(!shutdown, "Shut down");

        uint256 ripBal = 0;
        uint256 sRIPBal = oldsRIP.balanceOf(msg.sender);
        uint256 wsRIPBal = oldwsRIP.balanceOf(msg.sender);

        if (oldRIP.balanceOf(msg.sender) > 0 && ripMigrated) {
            ripBal = oldRIP.balanceOf(msg.sender);
            oldRIP.safeTransferFrom(msg.sender, address(this), ripBal);
        }
        if (sRIPBal > 0) {
            oldsRIP.safeTransferFrom(msg.sender, address(this), sRIPBal);
        }
        if (wsRIPBal > 0) {
            oldwsRIP.safeTransferFrom(msg.sender, address(this), wsRIPBal);
        }

        uint256 wAmount = wsRIPBal.add(oldwsRIP.sRIPTowRIP(ripBal.add(sRIPBal)));
        if (ripMigrated) {
            require(oldSupply >= oldRIP.totalSupply(), "RIPv1 minted");
            _send(wAmount, _to);
        } else {
            gRIP.mint(msg.sender, wAmount);
        }
    }

    // send preferred token
    function _send(uint256 wAmount, TYPE _to) internal {
        if (_to == TYPE.WRAPPED) {
            gRIP.safeTransfer(msg.sender, wAmount);
        } else if (_to == TYPE.STAKED) {
            newStaking.unwrap(msg.sender, wAmount);
        } else if (_to == TYPE.UNSTAKED) {
            newStaking.unstake(msg.sender, wAmount, false, false);
        }
    }

    // bridge back to RIP, sRIP, or wsRIP
    function bridgeBack(uint256 _amount, TYPE _to) external {
        if (!ripMigrated) {
            gRIP.burn(msg.sender, _amount);
        } else {
            gRIP.safeTransferFrom(msg.sender, address(this), _amount);
        }

        uint256 amount = oldwsRIP.wRIPTosRIP(_amount);
        // error throws if contract does not have enough of type to send
        if (_to == TYPE.UNSTAKED) {
            oldRIP.safeTransfer(msg.sender, amount);
        } else if (_to == TYPE.STAKED) {
            oldsRIP.safeTransfer(msg.sender, amount);
        } else if (_to == TYPE.WRAPPED) {
            oldwsRIP.safeTransfer(msg.sender, _amount);
        }
    }

    /* ========== OWNABLE ========== */

    // halt migrations (but not bridging back)
    function halt() external onlyPolicy {
        require(!ripMigrated, "Migration has occurred");
        shutdown = !shutdown;
    }

    // withdraw backing of migrated RIP
    function defund(address reserve) external onlyGovernor {
        require(ripMigrated, "Migration has not begun");
        require(timelockEnd < block.number && timelockEnd != 0, "Timelock not complete");

        oldwsRIP.unwrap(oldwsRIP.balanceOf(address(this)));

        uint256 amountToUnstake = oldsRIP.balanceOf(address(this));
        oldsRIP.approve(address(oldStaking), amountToUnstake);
        oldStaking.unstake(amountToUnstake, false);

        uint256 balance = oldRIP.balanceOf(address(this));

        if (balance > oldSupply) {
            oldSupply = 0;
        } else {
            oldSupply -= balance;
        }

        uint256 amountToWithdraw = balance.mul(1e9);
        oldRIP.approve(address(oldTreasury), amountToWithdraw);
        oldTreasury.withdraw(amountToWithdraw, reserve);
        IERC20(reserve).safeTransfer(address(newTreasury), IERC20(reserve).balanceOf(address(this)));

        emit Defunded(balance);
    }

    // start timelock to send backing to new treasury
    function startTimelock() external onlyGovernor {
        require(timelockEnd == 0, "Timelock set");
        timelockEnd = block.number.add(timelockLength);

        emit TimelockStarted(block.number, timelockEnd);
    }

    // set gRIP address
    function setgRIP(address _gRIP) external onlyGovernor {
        require(address(gRIP) == address(0), "Already set");
        require(_gRIP != address(0), "Zero address: gR.RIP");

        gRIP = IgRIP(_gRIP);
    }

    // call internal migrate token function
    function migrateToken(address token) external onlyGovernor {
        _migrateToken(token, false);
    }

    /**
     *   @notice Migrate LP and pair with new RIP
     */
    function migrateLP(
        address pair,
        bool ape,
        address token,
        uint256 _minA,
        uint256 _minB
    ) external onlyGovernor {
        uint256 oldLPAmount = IERC20(pair).balanceOf(address(oldTreasury));
        oldTreasury.manage(pair, oldLPAmount);

        IPancakeV2Router router = ApeRouter;
        if (!ape) {
            router = pancakeRouter;
        }

        IERC20(pair).approve(address(router), oldLPAmount);
        (uint256 amountA, uint256 amountB) = router.removeLiquidity(
            token,
            address(oldRIP),
            oldLPAmount,
            _minA,
            _minB,
            address(this),
            block.timestamp
        );

        newTreasury.mint(address(this), amountB);

        IERC20(token).approve(address(router), amountA);
        newRIP.approve(address(router), amountB);

        router.addLiquidity(
            token,
            address(newRIP),
            amountA,
            amountB,
            amountA,
            amountB,
            address(newTreasury),
            block.timestamp
        );
    }

    // Failsafe function to allow owner to withdraw funds sent directly to contract 
    // in case someone sends non-rip tokens to the contract
    function withdrawToken(
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external onlyGovernor {
        require(tokenAddress != address(0), "Token address cannot be 0x0");
        require(tokenAddress != address(gRIP), "Cannot withdraw: gR.RIP");
        require(tokenAddress != address(oldRIP), "Cannot withdraw: old-RIP");
        require(tokenAddress != address(oldsRIP), "Cannot withdraw: old-sR.RIP");
        require(tokenAddress != address(oldwsRIP), "Cannot withdraw: old-wsR.RIP");
        require(amount > 0, "Withdraw value must be greater than 0");
        if (recipient == address(0)) {
            recipient = msg.sender; // if no address is specified the value will will be withdrawn to Owner
        }

        IERC20 tokenContract = IERC20(tokenAddress);
        uint256 contractBalance = tokenContract.balanceOf(address(this));
        if (amount > contractBalance) {
            amount = contractBalance; // set the withdrawal amount equal to balance within the account.
        }
        // transfer the token from address of this contract
        tokenContract.safeTransfer(recipient, amount);
    }

    // migrate contracts
    function migrateContracts(
        address _newTreasury,
        address _newStaking,
        address _newRIP,
        address _newsRIP,
        address _reserve
    ) external onlyGovernor {
        require(!ripMigrated, "Already migrated");
        ripMigrated = true;
        shutdown = false;

        require(_newTreasury != address(0), "Zero address: Treasury");
        newTreasury = ITreasury(_newTreasury);
        require(_newStaking != address(0), "Zero address: Staking");
        newStaking = IStaking(_newStaking);
        require(_newRIP != address(0), "Zero address: RIP");
        newRIP = IERC20(_newRIP);

        oldSupply = oldRIP.totalSupply(); // log total supply at time of migration

        gRIP.migrate(_newStaking, _newsRIP); // change gRIP minter

        _migrateToken(_reserve, true); // will deposit tokens into new treasury so reserves can be accounted for

        _fund(oldsRIP.circulatingSupply()); // fund with current staked supply for token migration

        emit Migrated(_newStaking, _newTreasury);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    // fund contract with gRIP
    function _fund(uint256 _amount) internal {
        newTreasury.mint(address(this), _amount);
        newRIP.approve(address(newStaking), _amount);
        newStaking.stake(address(this), _amount, false, true); // stake and claim gRIP

        emit Funded(_amount);
    }

    /**
     *   @notice Migrate token from old treasury to new treasury
     */
    function _migrateToken(address token, bool deposit) internal {
        uint256 balance = IERC20(token).balanceOf(address(oldTreasury));

        uint256 excessReserves = oldTreasury.excessReserves();
        uint256 tokenValue = oldTreasury.valueOf(token, balance);

        if (tokenValue > excessReserves) {
            tokenValue = excessReserves;
            balance = excessReserves * 10**9;
        }

        oldTreasury.manage(token, balance);

        if (deposit) {
            IERC20(token).safeApprove(address(newTreasury), balance);
            newTreasury.deposit(balance, token, tokenValue);
        } else {
            IERC20(token).safeTransfer(address(newTreasury), balance);
        }
    }
}
