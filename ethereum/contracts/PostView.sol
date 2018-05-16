pragma solidity ^0.4.23;

import './PostBalance.sol';

contract PostView is PostBalance {
  mapping (uint256 => mapping (address => bool)) public hasViewed;
  
  event OnView (uint256 indexed postId, address indexed caller);
  
  function viewPost(uint256 _postId) public {
    _payViewer(_postId);
    _storeView(_postId);
  }
  
  function _storeView(uint256 _postId) private {
    hasViewed[_postId][msg.sender] = true;
    emit OnView(_postId, msg.sender);
  }
  
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