pragma solidity ^0.4.23;

import './UserModerator.sol';

contract UserOrganization is UserModerator {
  
  /**
    * @dev add Manager to Organization
    * @param _user User address
    */
  function organizationAddManager(address _user) public {
    require(memberOf[_user] == msg.sender && managerOf[_user] == 0x0);
    managerOf[_user] = msg.sender;
  }
  
  /**
    * @dev remove Manager from Organization
    * @param _user User address
    */
  function organizationRemoveManager(address _user) public {
    require(memberOf[_user] == msg.sender && managerOf[_user] == msg.sender);
    delete managerOf[_user];
  }
  
  /**
    * @dev add Members to Organization
    * @param _toAdd User address
    */
  function organizationAddMember(address[] _toAdd) public {
    require(memberOf[msg.sender] == managerOf[msg.sender] || managerOf[msg.sender] == msg.sender);
    addMembers(managerOf[msg.sender], _toAdd);
  }
  
  /**
    * @dev remove Members from Organzation
    * @param _toRemove User address
    */
  function organizationRemoveMember(address[] _toRemove) public {
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