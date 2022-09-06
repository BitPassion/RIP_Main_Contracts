// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "./libraries/SafeMath.sol";

import "./interfaces/IERC20.sol";
import "./interfaces/IRIP.sol";
import "./interfaces/IERC20Permit.sol";

import "./types/ERC20Permit.sol";
import "./types/RipProtocolAccessControlled.sol";

contract RipProtocolERC20Token is ERC20Permit, IRIP, RipProtocolAccessControlled {
    using SafeMath for uint256;

    constructor(address _authority)
        ERC20("r.rip", "R.RIP", 9)
        ERC20Permit("r.rip")
        RipProtocolAccessControlled(IRipProtocolAuthority(_authority))
    {}

    function mint(address account_, uint256 amount_) external override onlyVault {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account_, uint256 amount_) external override {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) internal {
        uint256 decreasedAllowance_ = allowance(account_, msg.sender).sub(
            amount_,
            "ERC20: burn amount exceeds allowance"
        );

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }
}
