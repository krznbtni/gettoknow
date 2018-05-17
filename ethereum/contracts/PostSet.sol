pragma solidity ^0.4.23;

import './PostVote.sol';

contract PostSet is PostVote {

  event OnSetPost(uint256 indexed postId, address indexed caller);

  /**
    * @dev Allows updating of Post ipfs hash.
    * Throws if not called by the post's creator or a Moderator.
    * @param _postId the post's id.
    * @param _newHash the new ipfs hash.
    */
  function setHash(uint256 _postId, string _newHash) public {
    require(postOwner[_postId] == msg.sender || users[msg.sender].role == Users.Role(3));
    postHashes[_postId] = _newHash;
    emit OnSetPost(_postId, msg.sender);
  }
  
  /**
    * @dev Allows updating of Post viewPrice.
    * Throws if not called by the post's creator or a Moderator.
    * @param _postId the post's id.
    * @param _newViewPrice the new viewPrice.
    */
  function setViewPrice(uint256 _postId, uint256 _newViewPrice) public {
    require(postOwner[_postId] == msg.sender || users[msg.sender].role == Users.Role(3));
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPrice, 64, 64);
    base[_postId] = packedBase;
    emit OnSetPost(_postId, msg.sender);
  }
  
  /**
    * @dev Allows updating of Post viewPricePercentage.
    * Throws if not called by the post's creator or a Moderator.
    * @param _postId the post's id.
    * @param _newViewPricePercentage the new viewPricePercentage.
    */
  function setViewPricePercentage(uint256 _postId, uint256 _newViewPricePercentage) public {
    require(postOwner[_postId] == msg.sender || users[msg.sender].role == Users.Role(3));
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPricePercentage, 127, 8);
    base[_postId] = packedBase;
    emit OnSetPost(_postId, msg.sender);
  }
  
  /**
    * @dev Allows updating of all Post properties
    * Throws if not called by the post's creator or a Moderator.
    * @param _postId the post's id.
    * @param _newHash the new ipfs hash.
    * @param _newViewPrice the new viewPrice.
    * @param _newViewPricePercentage the new viewPricePercentage.
    */
  function setPost(uint256 _postId, string _newHash, uint256 _newViewPrice, uint256 _newViewPricePercentage) public {
    require(postOwner[_postId] == msg.sender || users[msg.sender].role == Users.Role(3));
    postHashes[_postId] = _newHash;
    bytes32 packedBase = base[_postId];
    packedBase = packedBase.setData(_newViewPrice, 64, 64);
    packedBase = packedBase.setData(_newViewPricePercentage, 127, 8);
    base[_postId] = packedBase;
    emit OnSetPost(_postId, msg.sender);
  }
}