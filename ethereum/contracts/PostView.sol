pragma solidity ^0.4.23;

import './PostBalance.sol';

contract PostView is PostBalance {
  mapping (uint256 => mapping (address => bool)) public hasViewed;
  
  event OnView (uint256 indexed postId, address indexed caller);
  
  /**
    * @dev Sets off private functions: _storeView and _payViewer
    * @param _postId the post's id.
    */
  function viewPost(uint256 _postId) public {
    _payViewer(_postId);
    _storeView(_postId);
  }
  
  /**
    * @dev Fires event with indexed values of _postId and msg.sender
    * as a way of storing data instead of in a contract variable.
    * @param _postId the post's id.
    */
  function _storeView(uint256 _postId) private {
    hasViewed[_postId][msg.sender] = true;
    emit OnView(_postId, msg.sender);
  }
  
  /**
    * @dev Sends the viewPrice amount to every unique viewer.
    * Throws if called twice by the same user.
    * @param _postId the post's id.
    */
  function _payViewer(uint256 _postId) private {
    require(!hasViewed[_postId][msg.sender]);
    bytes32 packedBase = base[_postId];
    uint256 balance = packedBase.getData(0, 64);
    uint256 viewPrice = packedBase.getData(64, 64);
    
    require(balance >= viewPrice);
    
    balance = balance.sub(viewPrice);
    packedBase = packedBase.setData(balance, 0, 64);
    base[_postId] = packedBase;
    
    msg.sender.transfer(viewPrice);
  }
}