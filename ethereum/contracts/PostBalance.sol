pragma solidity ^0.4.23;

import './PostStorage.sol';

contract PostBalance is PostStorage {
  event OnDeposit (uint256 postId, uint256 amount, address caller);
  event OnWithdraw (uint256 postId, uint256 amount, address caller);
  
  /**
    * @dev Allows increasing the Post's balance.
    * @param _postId the post's id.
    */
  function deposit(uint256 _postId) public payable {
    bytes32 packedBase = base[_postId];
    uint256 balance = packedBase.getData(0, 64);
    
    balance = balance.add(msg.value);
    packedBase = packedBase.setData(balance, 0, 64);
    base[_postId] = packedBase;
    
    emit OnDeposit(_postId, msg.value, msg.sender);
  }
  
  /**
    * @dev Allows withdrawal of the Post's balance.
    * Throws if not called by the post's creator.
    * @param _postId the post's id.
    * @param _amount the value to be withdrawn.
    */
  function withdraw(uint256 _postId, uint256 _amount) public {
    require(postOwner[_postId] == msg.sender);
    bytes32 packedBase = base[_postId];
    uint256 balance = packedBase.getData(0, 64);
    require(balance >= _amount);
    
    balance = balance.sub(_amount);
    packedBase = packedBase.setData(balance, 0, 64);
    base[_postId] = packedBase;
    
    emit OnWithdraw(_postId, _amount, msg.sender);
    msg.sender.transfer(_amount);
  }
}