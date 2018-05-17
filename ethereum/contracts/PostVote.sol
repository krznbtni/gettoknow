pragma solidity ^0.4.23;

import './PostView.sol';

contract PostVote is PostView {
  event OnVote (uint256 indexed postId, bool indexed value, address indexed caller);
  
  /**
    * @dev Allows voting on a Post.
    * Throws if the caller's role is Unset and if postOwner is the caller
    * @param _postId the post's id.
    * @param _value true/false
    */
  function vote(uint256 _postId, bool _value) public {
    require(users[msg.sender].role != Users.Role(0) && postOwner[_postId] != msg.sender);
    bytes32 packedVotes = votes[_postId];
    uint256 upVotes = packedVotes.getData(0, 128);
    uint256 downVotes = packedVotes.getData(128, 128);
    
    if (_value) {
      upVotes = upVotes.add(1);
      packedVotes = packedVotes.setData(upVotes, 0, 128);
    } else {
      downVotes = downVotes.add(1);
      packedVotes = packedVotes.setData(downVotes, 128, 128);
    }
    
    votes[_postId] = packedVotes;
    emit OnVote(_postId, _value, msg.sender);
  }
}