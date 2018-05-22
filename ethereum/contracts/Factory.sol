pragma solidity ^0.4.23;

import './PostDelete.sol';

contract Factory is PostDelete {

  // transaction: 3438984 wei ()
  // * 5 gWei = 17194920 gWei = 0.01719492 ETH (110 SEK / $12)
  // * 6 gWei = 20633904 gWei = 0.020633904 ETH (130 SEK / $15)
  // * 8 gWei = 27511872 gWei = 0.027511872 ETH (170 SEK / $20)
  // * 10 gWei = 34389840 gWei = 0.03438984 ETH (210 SEK / $25)
  // * 12 gWei = 41267808 gWei = 0.041267808 ETH (250 SEK / $30)

  /**
    * @dev assign msg.sender the role of Moderator
    */
  constructor() public {
    setUser(msg.sender, 3, 'unset');
  }
}