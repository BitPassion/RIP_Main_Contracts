// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

import "./IERC20.sol";

// Old wsRIP interface
interface IwsRIP is IERC20 {
    function wrap(uint256 _amount) external returns (uint256);

    function unwrap(uint256 _amount) external returns (uint256);

    function wRIPTosRIP(uint256 _amount) external view returns (uint256);

    function sRIPTowRIP(uint256 _amount) external view returns (uint256);
}
