pragma solidity ^0.4.23;

import "../libraries/DataPacking.sol";
import "../user/UserRegular.sol";

contract PostStorage is UserRegular {
  using SafeMath for uint256;
  using DataPacking for bytes32;
  
  string[] public postHashes;
  uint256 public postCount;
  
  mapping (uint256 => address) public postOwner;
  mapping (uint256 => bytes32) public base;
  mapping (uint256 => bytes32) public votes;
  
  function createPost(string _hash, uint256 _viewPrice, uint256 _viewPricePercentage) public payable {
    require(users[msg.sender].role != Users.Role(0));
    postHashes.push(_hash);
    postOwner[postCount] = msg.sender;
    
    bytes32 packedBase;
    packedBase = packedBase.setData(msg.value, 0, 64);
    packedBase = packedBase.setData(_viewPrice, 64, 32);
    packedBase = packedBase.setData(_viewPricePercentage, 95, 8);
    
    base[postCount] = packedBase;
    postCount = postCount.add(1);
  }
  
  function unpackPost(uint256 _postId) public view returns (string, uint256, uint256, uint256, uint256, uint256) {
    bytes32 packedBase = base[_postId];
    bytes32 packedVotes = votes[_postId];
    
    return (
      postHashes[_postId],
      packedBase.getData(0, 64),
      packedBase.getData(64, 32),
      packedBase.getData(95, 8),
      packedVotes.getData(0, 128), // upvotes
      packedVotes.getData(128, 128) // downvotes
    );
  }
}