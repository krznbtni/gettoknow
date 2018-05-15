pragma solidity ^0.4.23;

import './UserOrganization.sol';

contract UserRegular is UserOrganization {
  
  /**
    * @dev "2-in-1" create and update user
    * @param _role User role
    * @param _profile User profile (ipfs hash)
    */
  function set(uint256 _role, string _profile) public {
    require(_role == 1 || _role == 2);
    setUser(msg.sender, _role, _profile);
  }
  
  /**
    * @dev update User role
    * @param _role new User role
    */
  function setRole(uint256 _role) public {
    require(_role == 1 || _role == 2);
    setRole(msg.sender, _role);
  }
  
  /**
    * @dev update User profile
    * @param _profile new User profile (ipfs hash)
    */
  function setProfile(string _profile) public {
    setProfile(msg.sender, _profile);
  }
  
  /**
    * @dev delete User
    */
  function deleteRegular() public {
    delete memberOf[msg.sender];
    delete memberIndex[msg.sender];
    delete managerOf[msg.sender];
    del(msg.sender);
  }
  
}