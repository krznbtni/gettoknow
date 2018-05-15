pragma solidity ^0.4.23;

import './Ownable.sol';
import './SafeMath.sol';
import './Users.sol';

contract UserGeneral is Ownable {
  using Users for Users.User;
  using SafeMath for uint256;
  
  uint256 public userCount;
  
  mapping(address => Users.User) public users;
  mapping(address => address) public memberOf;
  mapping(address => uint256) public memberIndex;
  mapping(address => address) public managerOf;
  
  /**
    * @dev "2-in-1" create and update user
    * @param _user User address
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function setUser(address _user, uint256 _role, string _profile) internal {
    users[_user].set(_role, _profile);
    
    if (_role == 2) {
      managerOf[_user] = _user;
    }
    
    userCount = userCount.add(1);
  }
  
  /**
    * @dev update User role
    * @param _user User address
    * @param _role new User role
    */
  function setRole(address _user, uint256 _role) internal {
    users[_user].setRole(_role);
  }
  
  /**
    * @dev update User profile
    * @param _user User address
    * @param _profile new User profile (ipfs hash)
    */
  function setProfile(address _user, string _profile) internal {
    users[_user].setProfile(_profile);
  }
  
  /**
    * @dev delete User
    * @param _user User address
    */
  function del(address _user) internal {
    users[_user].del();
    userCount = userCount.sub(1);
  }
  
  /**
    * @dev get User
    * @param _user User address
    */
  function getUser(address _user) public view returns (uint256, string, address[]) {
    return users[_user].get();
  }
  
  /**
    * @dev add Members to Organization
    * @param _organization Organzation address
    * @param _toAdd User address
    */
  function addMembers(address _organization, address[] _toAdd) internal {
    for (uint256 i = 0; i < _toAdd.length; i++) {
      // require: role of _toAdd == Regular
      require(users[_toAdd[i]].role == Users.Role(1));
      
      // require: _toAdd isn't a member of an Organization
      require(memberOf[_toAdd[i]] == address(0));
      
      // assign that _toAdd is a memberOf _organization
      memberOf[_toAdd[i]] = _organization;
      
      // assign _toAdd a uint. later used to remove this user from the Organization.
      memberIndex[_toAdd[i]] = users[_organization].members.length;
      
      // push _toAdd into _organization's array of members
      users[_organization].addMember(_toAdd[i]);
    }
  }
  
  /**
    * @dev remove Members from Organzation
    * @param _organization Organization address
    * @param _toRemove User address
    */
  function removeMembers(address _organization, address[] _toRemove) internal {
    for (uint256 i = 0; i < _toRemove.length; i++) {
      // require: _toRemove is a memberOf _organization
      require(memberOf[_toRemove[i]] == _organization);
      
      // fetch memberIndex
      uint256 id = memberIndex[_toRemove[i]];
      
      // use memberIndex to remove the User
      users[_organization].removeMember(id);
      
      // delete association with the organization
      delete memberOf[_toRemove[i]];
      
      // delete managerOf
      delete managerOf[_toRemove[i]];

      // delete memberIndex
      delete memberIndex[_toRemove[i]];
    }
  }
}