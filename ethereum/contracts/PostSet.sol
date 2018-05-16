pragma solidity ^0.4.23;

import './PostVote.sol';

contract PostSet is PostVote {
  function setHash(uint256 _postId, string _newHash) public {
    require(postOwner[_postId] == msg.sender);
    postHashes[_postId] = _newHash;
  }
  
  function setViewPrice(uint256 _postId, uint256 _newViewPrice) public {
    require(postOwner[_postId] == msg.sender);
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPrice, 64, 64);
    base[_postId] = packedBase;
  }
  
  function setViewPricePercentage(uint256 _postId, uint256 _newViewPricePercentage) public {
    require(postOwner[_postId] == msg.sender);
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPricePercentage, 127, 8);
    base[_postId] = packedBase;
  }
  
  function setPost(uint256 _postId, string _newHash, uint256 _newViewPrice, uint256 _newViewPricePercentage) public {
    require(postOwner[_postId] == msg.sender);
    postHashes[_postId] = _newHash;
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPrice, 64, 64);
    packedBase = packedBase.setData(_newViewPricePercentage, 127, 8);
    base[_postId] = packedBase;
  }
}