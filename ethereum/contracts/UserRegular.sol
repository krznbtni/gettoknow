pragma solidity ^0.4.23;

import './UserOrganization.sol';

contract UserRegular is UserOrganization {
  
  /**
    * @dev Allows to create a profile
    * Throws if (_role == Unset || _role == Moderator)
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function set(uint256 _role, string _profile) public {
    require(_role == 1 || _role == 2);
    setUser(msg.sender, _role, _profile);
  }
  
  /**
    * @dev Allows to update user role
    * Throws if (_role == Unset || _role == Moderator)
    * @param _role new User role
    */
  function setRole(uint256 _role) public {
    require(_role == 1 || _role == 2);
    setRole(msg.sender, _role);
  }
  
  /**
    * @dev Allows to update ipfs hash
    * Throws if (_role == Unset || _role == Moderator)
    * @param _profile new User profile (ipfs hash)
    */
  function setProfile(string _profile) public {
    setProfile(msg.sender, _profile);
  }
  
  /**
    * @dev Allows deleting of entire profile
    */
  function deleteRegular() public {
    delete memberOf[msg.sender];
    delete memberIndex[msg.sender];
    delete managerOf[msg.sender];
    del(msg.sender);
  }
  
}