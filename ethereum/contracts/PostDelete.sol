pragma solidity ^0.4.23;

import './PostSet.sol';

contract PostDelete is PostSet {
  event OnDelete(uint256 postId, address caller);
  
  function deletePost(uint256 _postId) public {
    require(postOwner[_postId] == msg.sender);
    bytes32 packedBase = base[_postId];
    uint256 balance = packedBase.getData(0,  64);
    emit OnDelete(_postId, msg.sender);
    msg.sender.transfer(balance);
    delete postHashes[_postId];
    delete base[_postId];
    delete votes[_postId];
    delete postOwner[_postId];
  }
}