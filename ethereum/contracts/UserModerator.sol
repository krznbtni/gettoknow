pragma solidity ^0.4.23;

import './UserOwner.sol';

contract UserModerator is UserOwner {

  modifier onlyModerator {
    require(users[msg.sender].role == Users.Role(3));
    _;
  }
  
  /**
    * @dev Allows Moderator to create and update a user's profile.
    * Throws if (_role == Unset || _role == Moderator)
    * @param _user User address
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function moderatorSet(address _user, uint256 _role, string _profile) public onlyModerator {
    require(_role == 1 || _role == 2);
    setUser(_user, _role, _profile);
  }
  
  /**
    * @dev Allows Moderator to update a user's role.
    * Throws if (_role == Unset || _role == Moderator)
    * @param _user User address
    * @param _role new User role
    */
  function moderatorSetRole(address _user, uint256 _role) public onlyModerator {
    require(users[_user].role != Users.Role(3));
    require(_role == 1 || _role == 2);
    setRole(_user, _role);
  }
  
  /**
    * @dev Allows Moderator to update a user's ipfs hash
    * @param _user User address
    * @param _profile new User profile (ipfs hash)
    */
  function moderatorSetProfile(address _user, string _profile) public onlyModerator {
    setProfile(_user, _profile);
  }
  
  /**
    * @dev Allows Moderator to add members to an Organization.
    * @param _organization Organzation address
    * @param _toAdd User address
    */
  function moderatorAddMembers(address _organization, address[] _toAdd) public onlyModerator {
    addMembers(_organization, _toAdd);
  }
  
  /**
    * @dev Allows Moderator to remove members fron an Organization.
    * @param _organization Organization address
    * @param _toRemove User address
    */
  function moderatorRemoveMembers(address _organization, address[] _toRemove) public onlyModerator {
    removeMembers(_organization, _toRemove);
  }
  
  /**
    * @dev Allows Moderator to delete an Organization
    * @param _organization Organization address
    */
  function moderatorDeleteOrganization(address _organization) public onlyModerator {
    require(users[_organization].role == Users.Role(2));
    for (uint256 i = 0; i < users[_organization].members.length; i++) {
      delete memberOf[users[_organization].members[i]];
      delete memberIndex[users[_organization].members[i]];
      delete managerOf[users[_organization].members[i]];
    }
    del(_organization);
  }
  
  /**
    * @dev Allows Moderator to delete a Regular user
    * @param _user User address
    */
  function moderatorDeleteRegular(address _user) public onlyModerator {
    require(users[_user].role == Users.Role(1));
    delete memberOf[_user];
    delete memberIndex[_user];
    delete managerOf[_user];
    del(_user);
  }

  /**
    * @dev Allows a Moderator to delete their profile.
    * Throws if called by Owner.
    */
  function deleteModerator() public onlyModerator {
    require(owner != msg.sender);
    del(msg.sender);
  }
}