pragma solidity ^0.4.23;

import './UserGeneral.sol';

contract UserModerator is UserGeneral {
  modifier onlyModerator {
    require(users[msg.sender].role == Users.Role(3));
    _;
  }
  
  /**
    * @dev "2-in-1" create and update user
    * @param _user User address
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function moderatorSet(address _user, uint256 _role, string _profile) public onlyModerator {
    setUser(_user, _role, _profile);
  }
  
  /**
    * @dev update User role
    * @param _user User address
    * @param _role new User role
    */
  function moderatorSetRole(address _user, uint256 _role) public onlyModerator {
    setRole(_user, _role);
  }
  
  /**
    * @dev update User profile
    * @param _user User address
    * @param _profile new User profile (ipfs hash)
    */
  function moderatorSetProfile(address _user, string _profile) public onlyModerator {
    setProfile(_user, _profile);
  }
  
  /**
    * @dev add Members to Organization
    * @param _organization Organzation address
    * @param _toAdd User address
    */
  function moderatorAddMember(address _organization, address[] _toAdd) public onlyModerator {
    addMembers(_organization, _toAdd);
  }
  
  /**
    * @dev remove Members from Organzation
    * @param _organization Organization address
    * @param _toRemove User address
    */
  function moderatorRemoveMember(address _organization, address[] _toRemove) public onlyModerator {
    removeMembers(_organization, _toRemove);
  }
  
  /**
    * @dev delete Organization
    * @param _organization Organization address
    */
  function moderatorDeleteOrganization(address _organization) public onlyModerator {
    for (uint256 i = 0; i < users[_organization].members.length; i++) {
      delete memberOf[users[_organization].members[i]];
      delete memberIndex[users[_organization].members[i]];
      delete managerOf[users[_organization].members[i]];
    }
    del(_organization);
  }
  
  /**
    * @dev delete User
    * @param _user User address
    */
  function moderatorDeleteRegular(address _user) public onlyModerator {
    del(_user);
  }
}