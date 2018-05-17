pragma solidity ^0.4.23;

import './DataPacking.sol';
import './UserRegular.sol';

contract PostStorage is UserRegular {
  using SafeMath for uint256;
  using DataPacking for bytes32;
  
  string[] public postHashes;
  uint256 public postCount;
  
  mapping (uint256 => address) public postOwner;
  mapping (uint256 => bytes32) public base;
  mapping (uint256 => bytes32) public votes;

  event OnCreatePost(uint256 indexed postId, address indexed caller);
  
  /**
    * @dev Allows creation of a Post. The data is packed into 1 bytes32 using the DataPacking library.
    * @param _hash the post's ipfs hash.
    * @param _viewPrice amount to be sent to every unique viewer.
    * @param _viewPricePercentage percentage of viewPrice to be sent to post creator
    * if s/he is part of an Organization.
    */
  function createPost(string _hash, uint256 _viewPrice, uint256 _viewPricePercentage) public payable {
    require(users[msg.sender].role != Users.Role(0));
    postHashes.push(_hash);
    postOwner[postCount] = msg.sender;
    
    bytes32 packedBase;
    packedBase = packedBase.setData(msg.value, 0, 64);
    packedBase = packedBase.setData(_viewPrice, 64, 64);
    packedBase = packedBase.setData(_viewPricePercentage, 127, 8);
    
    base[postCount] = packedBase;

    emit OnCreatePost(postCount, msg.sender);

    postCount = postCount.add(1);
  }
  
  /**
    * @dev Unpacks the post's data using the DataPacking library.
    * @param _postId the post's id.
    */
  function unpackPost(uint256 _postId) public view returns (string, uint256, uint256, uint256, uint256, uint256) {
    bytes32 packedBase = base[_postId];
    bytes32 packedVotes = votes[_postId];
    
    return (
      postHashes[_postId],
      packedBase.getData(0, 64),
      packedBase.getData(64, 64),
      packedBase.getData(127, 8),
      packedVotes.getData(0, 128), // upvotes
      packedVotes.getData(128, 128) // downvotes
    );
  }
}