pragma solidity ^0.4.23;

import './PostSet.sol';

contract PostDelete is PostSet {
  event OnDelete(uint256 indexed postId, address indexed caller);
  
  /**
    * @dev Allows deleting of a Post. The remaining balance is sent to the post owner.
    * Throws if not called by the post's creator or a Moderator.
    * @param _postId the post's id.
    */
  function deletePost(uint256 _postId) public {
    require(postOwner[_postId] == msg.sender || users[msg.sender].role == Users.Role(3));
    bytes32 packedBase = base[_postId];
    uint256 balance = packedBase.getData(0,  64);
    emit OnDelete(_postId, msg.sender);
    postOwner[_postId].transfer(balance);
    delete postHashes[_postId];
    delete base[_postId];
    delete votes[_postId];
    delete postOwner[_postId];
  }
}