pragma solidity ^0.4.23;

import './UserGeneral.sol';

contract UserOwner is UserGeneral {

  /**
    * @dev Allows Owner to create and update a user's profile.
    * @param _user User address
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function ownerSet(address _user, uint256 _role, string _profile) public onlyOwner {
    setUser(_user, _role, _profile);
  }

  /**
    * @dev Allows Owner to update a user's role
    * @param _user User address
    * @param _role new User role
    */
  function ownerSetRole(address _user, uint256 _role) public onlyOwner {
    setRole(_user, _role);
  }

  /*
    * @dev Allows Owner to delete a Moderator user
    * @param _moderator Moderator address
    */
  function ownerDeleteModerator(address _moderator) public onlyOwner {
    require(users[_moderator].role == Users.Role(3));
    del(_moderator);
  }

}