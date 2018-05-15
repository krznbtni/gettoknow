pragma solidity ^0.4.23;

library Users {

  struct User {
    Role role;
    string profile; // ipfs hash
    address[] members;
  }
  
  enum Role { UNSET, REGULAR, ORGANIZATION, MODERATOR }
  
  /**
    * @dev "2-in-1" create and update user
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function set(User storage user, uint256 _role, string _profile) internal {
    require(_role > 0 && _role < 4);
    user.role = Role(_role);
    user.profile = _profile;
  }
  
  /**
    * @dev update User role
    * @param _role new User role
    */
  function setRole(User storage user, uint256 _role) internal {
    require(_role > 0 && _role < 4);
    user.role = Role(_role);
  }
  
  /**
    * @dev update User profile
    * @param _profile new User profile (ipfs hash)
    */
  function setProfile(User storage user, string _profile) internal {
    user.profile = _profile;
  }
  
  /**
    * @dev return User values
    * @notice the 
    */
  function get(User storage user) internal view returns (uint256, string, address[]) {
    return (
      uint256(user.role),
      user.profile,
      user.members
    );
  }
  
  /**
    * @dev delete User
    */
  function del(User storage user) internal {
    delete user.role;
    delete user.profile;
    delete user.members;
  }
  
  /**
    * @dev add User to Organization
    * @param _toAdd User address
    */
  function addMember(User storage user, address _toAdd) internal {
    require(user.role == Role.ORGANIZATION);
    user.members.push(_toAdd);
  }
  
  /**
    * @dev remove Member from Organzation
    * @param _toRemove User position in Members array
    */
  function removeMember(User storage user, uint256 _toRemove) internal {
    require(user.role == Role.ORGANIZATION);
    delete user.members[_toRemove];
  }
}