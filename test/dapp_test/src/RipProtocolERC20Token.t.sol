// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "ds-test/test.sol"; // ds-test
import "../../../contracts/RipProtocolERC20.sol";

import "../../../contracts/RipProtocolAuthority.sol";

contract RipProtocolERC20TokenTest is DSTest {
    RipProtocolERC20Token internal ripContract;

    IRipProtocolAuthority internal authority;

    address internal UNAUTHORIZED_USER = address(0x1);

    function test_erc20() public {
        authority = new RipProtocolAuthority(address(this), address(this), address(this), address(this));
        ripContract = new RipProtocolERC20Token(address(authority));
        assertEq("RipProtocol", ripContract.name());
        assertEq("RIP", ripContract.symbol());
        assertEq(9, int256(ripContract.decimals()));
    }

    function testCannot_mint() public {
        authority = new RipProtocolAuthority(address(this), address(this), address(this), UNAUTHORIZED_USER);
        ripContract = new RipProtocolERC20Token(address(authority));
        // try/catch block pattern copied from https://github.com/Anish-Agnihotri/MultiRaffle/blob/master/src/test/utils/DSTestExtended.sol
        try ripContract.mint(address(this), 100) {
            fail();
        } catch Error(string memory error) {
            // Assert revert error matches expected message
            assertEq("UNAUTHORIZED", error);
        }
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_mint(uint256 amount) public {
        authority = new RipProtocolAuthority(address(this), address(this), address(this), address(this));
        ripContract = new RipProtocolERC20Token(address(authority));
        uint256 supplyBefore = ripContract.totalSupply();
        // TODO look into https://dapphub.chat/channel/dev?msg=HWrPJqxp8BHMiKTbo
        // ripContract.setVault(address(this)); //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        ripContract.mint(address(this), amount);
        assertEq(supplyBefore + amount, ripContract.totalSupply());
    }

    // Tester will pass it's own parameters, see https://fv.ethereum.org/2020/12/11/symbolic-execution-with-ds-test/
    function test_burn(uint256 mintAmount, uint256 burnAmount) public {
        authority = new RipProtocolAuthority(address(this), address(this), address(this), address(this));
        ripContract = new RipProtocolERC20Token(address(authority));
        uint256 supplyBefore = ripContract.totalSupply();
        // ripContract.setVault(address(this));  //TODO WTF msg.sender doesn't propigate from .dapprc $DAPP_TEST_CALLER config via mint() call, must use this value
        ripContract.mint(address(this), mintAmount);
        if (burnAmount <= mintAmount) {
            ripContract.burn(burnAmount);
            assertEq(supplyBefore + mintAmount - burnAmount, ripContract.totalSupply());
        } else {
            try ripContract.burn(burnAmount) {
                fail();
            } catch Error(string memory error) {
                // Assert revert error matches expected message
                assertEq("ERC20: burn amount exceeds balance", error);
            }
        }
    }
}
