/**
 *Submitted for verification at Etherscan.io on 2021-03-23
*/

// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "./libraries/SafeMath.sol";

import "./interfaces/IERC20.sol";

interface IOwnable {

  function owner() external view returns (address);

  function renounceOwnership() external;
  
  function transferOwnership( address newOwner_ ) external;
}

contract Ownable is IOwnable {
    
  address internal _owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev Initializes the contract setting the deployer as the initial owner.
   */
  constructor () {
    _owner = msg.sender;
    emit OwnershipTransferred( address(0), _owner );
  }

  /**
   * @dev Returns the address of the current owner.
   */
  function owner() public view override returns (address) {
    return _owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require( _owner == msg.sender, "Ownable: caller is not the owner" );
    _;
  }

  /**
   * @dev Leaves the contract without owner. It will not be possible to call
   * `onlyOwner` functions anymore. Can only be called by the current owner.
   *
   * NOTE: Renouncing ownership will leave the contract without an owner,
   * thereby removing any functionality that is only available to the owner.
   */
  function renounceOwnership() public virtual override onlyOwner() {
    emit OwnershipTransferred( _owner, address(0) );
    _owner = address(0);
  }

  /**
   * @dev Transfers ownership of the contract to a new account (`newOwner`).
   * Can only be called by the current owner.
   */
  function transferOwnership( address newOwner_ ) public virtual override onlyOwner() {
    require( newOwner_ != address(0), "Ownable: new owner is the zero address");
    emit OwnershipTransferred( _owner, newOwner_ );
    _owner = newOwner_;
  }
}

contract aRIPMigration is Ownable {
  using SafeMath for uint256;

  uint256 swapEndBlock;

  IERC20 public RIP;
  IERC20 public aRIP;

  address presale;
  
  bool public isInitialized;

  mapping(address => uint256) public senderInfo;
  
  modifier onlyInitialized() {
    require(isInitialized, "not initialized");
    _;
  }
  
  modifier notInitialized() {
    require( !isInitialized, "already initialized" );
    _;
  }

  function initialize (
    address _RIP,
    address _aRIP,
    uint256 _swapDuration,
    address _presale
  ) public onlyOwner() notInitialized() {
    RIP = IERC20(_RIP);
    aRIP = IERC20(_aRIP);
    presale = _presale;
    swapEndBlock = block.number.add(_swapDuration);
    isInitialized = true;
  }

  function migrate(uint256 amount) external onlyInitialized() {
    require(
        aRIP.balanceOf(msg.sender) >= amount,
        "amount above user balance"
    );
    require(block.number < swapEndBlock, "swapping of aRIP has ended");
    require(RIP.balanceOf(address(this)) > 0, "RIP not enough");

    aRIP.transferFrom(msg.sender, address(this), amount);
    senderInfo[msg.sender] = senderInfo[msg.sender].add(amount);
    require(circulatingSupply() > 0, "no supply");
    uint256 ripAmount = RIP.balanceOf(address(this)).mul(amount).div(circulatingSupply());
    RIP.transfer(msg.sender, ripAmount);
  }

  function reclaim() external {
    require(senderInfo[msg.sender] > 0, "user has no aRIP to withdraw");
    require(
        block.number > swapEndBlock,
        "aRIP swap is still ongoing"
    );

    uint256 amount = senderInfo[msg.sender];
    senderInfo[msg.sender] = 0;
    aRIP.transfer(msg.sender, amount);
  }

  function withdraw(address token) external onlyOwner() {
    require(block.number > swapEndBlock, "swapping of aRIP has not ended");
    require(token != address(aRIP), "aRIP is not allowed to be withdrawn");
    uint256 amount = IERC20(token).balanceOf(address(this));
    require(amount > 0, "no token balance");
    IERC20(token).transfer(msg.sender, amount);
  }

  function circulatingSupply() public view returns (uint256) {
    return IERC20(aRIP).totalSupply().sub(IERC20(aRIP).balanceOf(presale)).sub(IERC20(aRIP).balanceOf(address(this))).sub(IERC20(aRIP).balanceOf(_owner));
  }
}