// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../types/Ownable.sol";

contract RipFaucet is Ownable {
    IERC20 public rip;

    constructor(address _rip) {
        rip = IERC20(_rip);
    }

    function setRip(address _rip) external onlyOwner {
        rip = IERC20(_rip);
    }

    function dispense() external {
        rip.transfer(msg.sender, 1e9);
    }
}
