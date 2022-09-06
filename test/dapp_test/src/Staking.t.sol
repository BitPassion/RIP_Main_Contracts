// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;
pragma abicoder v2;

import "ds-test/test.sol"; // ds-test

import "../../../contracts/libraries/SafeMath.sol";
import "../../../contracts/libraries/FixedPoint.sol";
import "../../../contracts/libraries/FullMath.sol";
import "../../../contracts/Staking.sol";
import "../../../contracts/RipProtocolERC20.sol";
import "../../../contracts/sRipProtocolERC20.sol";
import "../../../contracts/governance/gRIP.sol";
import "../../../contracts/Treasury.sol";
import "../../../contracts/StakingDistributor.sol";
import "../../../contracts/RipProtocolAuthority.sol";

import "./util/Hevm.sol";
import "./util/MockContract.sol";

contract StakingTest is DSTest {
    using FixedPoint for *;
    using SafeMath for uint256;
    using SafeMath for uint112;

    RipProtocolStaking internal staking;
    RipProtocolTreasury internal treasury;
    RipProtocolAuthority internal authority;
    Distributor internal distributor;

    RipProtocolERC20Token internal rip;
    sRipProtocol internal srip;
    gRIP internal grip;

    MockContract internal mockToken;

    /// @dev Hevm setup
    Hevm internal constant hevm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    uint256 internal constant AMOUNT = 1000;
    uint256 internal constant EPOCH_LENGTH = 8; // In Seconds
    uint256 internal constant START_TIME = 0; // Starting at this epoch
    uint256 internal constant NEXT_REBASE_TIME = 1; // Next epoch is here
    uint256 internal constant BOUNTY = 42;

    function setUp() public {
        // Start at timestamp
        hevm.warp(START_TIME);

        // Setup mockToken to deposit into treasury (for excess reserves)
        mockToken = new MockContract();
        mockToken.givenMethodReturn(abi.encodeWithSelector(ERC20.name.selector), abi.encode("mock DAO"));
        mockToken.givenMethodReturn(abi.encodeWithSelector(ERC20.symbol.selector), abi.encode("MOCK"));
        mockToken.givenMethodReturnUint(abi.encodeWithSelector(ERC20.decimals.selector), 18);
        mockToken.givenMethodReturnBool(abi.encodeWithSelector(IERC20.transferFrom.selector), true);

        authority = new RipProtocolAuthority(address(this), address(this), address(this), address(this));

        rip = new RipProtocolERC20Token(address(authority));
        grip = new gRIP(address(this), address(this));
        srip = new sRipProtocol();
        srip.setIndex(10);
        srip.setgRIP(address(grip));

        treasury = new RipProtocolTreasury(address(rip), 1, address(authority));

        staking = new RipProtocolStaking(
            address(rip),
            address(srip),
            address(grip),
            EPOCH_LENGTH,
            START_TIME,
            NEXT_REBASE_TIME,
            address(authority)
        );

        distributor = new Distributor(address(treasury), address(rip), address(staking), address(authority));
        distributor.setBounty(BOUNTY);
        staking.setDistributor(address(distributor));
        treasury.enable(RipProtocolTreasury.STATUS.REWARDMANAGER, address(distributor), address(0)); // Allows distributor to mint rip.
        treasury.enable(RipProtocolTreasury.STATUS.RESERVETOKEN, address(mockToken), address(0)); // Allow mock token to be deposited into treasury
        treasury.enable(RipProtocolTreasury.STATUS.RESERVEDEPOSITOR, address(this), address(0)); // Allow this contract to deposit token into treeasury

        srip.initialize(address(staking), address(treasury));
        grip.migrate(address(staking), address(srip));

        // Give the treasury permissions to mint
        authority.pushVault(address(treasury), true);

        // Deposit a token who's profit (3rd param) determines how much rip the treasury can mint
        uint256 depositAmount = 20e18;
        treasury.deposit(depositAmount, address(mockToken), BOUNTY.mul(2)); // Mints (depositAmount- 2xBounty) for this contract
    }

    function testStakeNoBalance() public {
        uint256 newAmount = AMOUNT.mul(2);
        try staking.stake(address(this), newAmount, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds balance'
        }
    }

    function testStakeWithoutAllowance() public {
        try staking.stake(address(this), AMOUNT, true, true) {
            fail();
        } catch Error(string memory error) {
            assertEq(error, "TRANSFER_FROM_FAILED"); // Should be 'Transfer exceeds allowance'
        }
    }

    function testStake() public {
        rip.approve(address(staking), AMOUNT);
        uint256 amountStaked = staking.stake(address(this), AMOUNT, true, true);
        assertEq(amountStaked, AMOUNT);
    }

    function testStakeAtRebaseToGrip() public {
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        rip.approve(address(staking), AMOUNT);
        bool isSrip = false;
        bool claim = true;
        uint256 gRIPRecieved = staking.stake(address(this), AMOUNT, isSrip, claim);

        uint256 expectedAmount = grip.balanceTo(AMOUNT.add(BOUNTY));
        assertEq(gRIPRecieved, expectedAmount);
    }

    function testStakeAtRebase() public {
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        rip.approve(address(staking), AMOUNT);
        bool isSrip = true;
        bool claim = true;
        uint256 amountStaked = staking.stake(address(this), AMOUNT, isSrip, claim);

        uint256 expectedAmount = AMOUNT.add(BOUNTY);
        assertEq(amountStaked, expectedAmount);
    }

    function testUnstake() public {
        bool triggerRebase = true;
        bool isSrip = true;
        bool claim = true;

        // Stake the rip
        uint256 initialRipBalance = rip.balanceOf(address(this));
        rip.approve(address(staking), initialRipBalance);
        uint256 amountStaked = staking.stake(address(this), initialRipBalance, isSrip, claim);
        assertEq(amountStaked, initialRipBalance);

        // Validate balances post stake
        uint256 ripBalance = rip.balanceOf(address(this));
        uint256 sRipBalance = srip.balanceOf(address(this));
        assertEq(ripBalance, 0);
        assertEq(sRipBalance, initialRipBalance);

        // Unstake sRIP
        srip.approve(address(staking), sRipBalance);
        staking.unstake(address(this), sRipBalance, triggerRebase, isSrip);

        // Validate Balances post unstake
        ripBalance = rip.balanceOf(address(this));
        sRipBalance = srip.balanceOf(address(this));
        assertEq(ripBalance, initialRipBalance);
        assertEq(sRipBalance, 0);
    }

    function testUnstakeAtRebase() public {
        bool triggerRebase = true;
        bool isSrip = true;
        bool claim = true;

        // Stake the rip
        uint256 initialRipBalance = rip.balanceOf(address(this));
        rip.approve(address(staking), initialRipBalance);
        uint256 amountStaked = staking.stake(address(this), initialRipBalance, isSrip, claim);
        assertEq(amountStaked, initialRipBalance);

        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        // Validate balances post stake
        // Post initial rebase, distribution amount is 0, so sRIP balance doens't change.
        uint256 ripBalance = rip.balanceOf(address(this));
        uint256 sRipBalance = srip.balanceOf(address(this));
        assertEq(ripBalance, 0);
        assertEq(sRipBalance, initialRipBalance);

        // Unstake sRIP
        srip.approve(address(staking), sRipBalance);
        staking.unstake(address(this), sRipBalance, triggerRebase, isSrip);

        // Validate balances post unstake
        ripBalance = rip.balanceOf(address(this));
        sRipBalance = srip.balanceOf(address(this));
        uint256 expectedAmount = initialRipBalance.add(BOUNTY); // Rebase earns a bounty
        assertEq(ripBalance, expectedAmount);
        assertEq(sRipBalance, 0);
    }

    function testUnstakeAtRebaseFromGrip() public {
        bool triggerRebase = true;
        bool isSrip = false;
        bool claim = true;

        // Stake the rip
        uint256 initialRipBalance = rip.balanceOf(address(this));
        rip.approve(address(staking), initialRipBalance);
        uint256 amountStaked = staking.stake(address(this), initialRipBalance, isSrip, claim);
        uint256 gripAmount = grip.balanceTo(initialRipBalance);
        assertEq(amountStaked, gripAmount);

        // test the unstake
        // Move into next rebase window
        hevm.warp(EPOCH_LENGTH);

        // Validate balances post-stake
        uint256 ripBalance = rip.balanceOf(address(this));
        uint256 gripBalance = grip.balanceOf(address(this));
        assertEq(ripBalance, 0);
        assertEq(gripBalance, gripAmount);

        // Unstake gRIP
        grip.approve(address(staking), gripBalance);
        staking.unstake(address(this), gripBalance, triggerRebase, isSrip);

        // Validate balances post unstake
        ripBalance = rip.balanceOf(address(this));
        gripBalance = grip.balanceOf(address(this));
        uint256 expectedRip = initialRipBalance.add(BOUNTY); // Rebase earns a bounty
        assertEq(ripBalance, expectedRip);
        assertEq(gripBalance, 0);
    }
}
