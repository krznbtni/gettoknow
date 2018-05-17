pragma solidity ^0.4.23;

import './UserModerator.sol';

contract UserOrganization is UserModerator {
  
  /**
    * @dev add Manager to Organization
    * @param _toAdd User address
    */
  function organizationAddManagers(address[] _toAdd) public {
    for (uint256 i = 0; i < _toAdd.length; i++) {
      require(memberOf[_toAdd[i]] == msg.sender && managerOf[_toAdd[i]] == 0x0);
      managerOf[_toAdd[i]] = msg.sender;
      emit OnAddManagers(msg.sender, _toAdd[i], msg.sender);
    }
  }
  
  /**
    * @dev remove Manager from Organization
    * @param _toRemove User address
    */
  function organizationRemoveManagers(address[] _toRemove) public {
    for (uint256 i = 0; i < _toRemove.length; i++) {
      require(memberOf[_toRemove[i]] == msg.sender && managerOf[_toRemove[i]] == msg.sender);
      delete managerOf[_toRemove[i]];
      emit OnRemoveManagers(msg.sender, _toRemove[i], msg.sender);
    }
  }
  
  /**
    * @dev add Members to Organization
    * @param _toAdd User address
    */
  function organizationAddMembers(address[] _toAdd) public {
    require(memberOf[msg.sender] == managerOf[msg.sender] || managerOf[msg.sender] == msg.sender);
    addMembers(managerOf[msg.sender], _toAdd);
  }
  
  /**
    * @dev remove Members from Organzation
    * @param _toRemove User address
    */
  function organizationRemoveMembers(address[] _toRemove) public {
    require(memberOf[msg.sender] == managerOf[msg.sender] || managerOf[msg.sender] == msg.sender);
    removeMembers(managerOf[msg.sender], _toRemove);
  }
  
  /**
    * @dev delete Organization
    */
  function deleteOrganization() public {
    require(users[msg.sender].role == Users.Role(2));
    for (uint256 i = 0; i < users[msg.sender].members.length; i++) {
      delete memberOf[users[msg.sender].members[i]];
      delete memberIndex[users[msg.sender].members[i]];
      delete managerOf[users[msg.sender].members[i]];
    }
    del(msg.sender);
  }
  
}