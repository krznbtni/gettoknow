pragma solidity ^0.4.23;

import "./PostView.sol";

contract PostVote is PostView {
  event OnVote (uint256 indexed postId, bool indexed value, address indexed caller);
  
  function vote(uint256 _postId, bool _value) public {
    require(users[msg.sender].role != Users.Role(0));
    bytes32 packedVotes = votes[_postId];
    uint256 upvotes = packedVotes.getData(0, 128);
    uint256 downvotes = packedVotes.getData(128, 128);
    
    if (_value) {
      upvotes = upvotes.add(1);
      packedVotes = packedVotes.setData(upvotes, 0, 128);
    } else {
      downvotes = downvotes.add(1);
      packedVotes = packedVotes.setData(downvotes, 128, 128);
    }
    
    votes[_postId] = packedVotes;
    emit OnVote(_postId, _value, msg.sender);
  }
}