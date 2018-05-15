pragma solidity ^0.4.23;

import './PostDelete.sol';

contract Factory is PostDelete {
  /**
    * @dev assign msg.sender the role of Moderator
    */
  constructor() public {
    setUser(msg.sender, 3, 'unset');
  }
}