const assert = require('chai').assert,
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    regularUser, // accounts[1]
    organizationUser; // accounts[2]

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[1], gas: '1000000' });
  regularUser = await factory.methods.getUser(accounts[1]).call();

  await factory.methods.set(2, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });
  organizationUser = await factory.methods.getUser(accounts[2]).call();
});

describe('Contract: UserRegular', () => {
  describe('Function: set(uint256 _role, string _profile))', () => {
    it('allows a new user to sign up as Regular', async () => {
      const role = regularUser[0];
      const ipfsHash = regularUser[1];
  
      assert.equal(1, role);
      assert.equal('ipfsHash', ipfsHash);
    });

    it('allows a new user to sign up as Organization', async () => {
      const role = organizationUser[0];
      const ipfsHash = organizationUser[1];
  
      assert.equal(2, role);
      assert.equal('ipfsHash', ipfsHash);
    });
  
    it('does not allow a new user to sign up as Moderator', async () => {
      let revert;
  
      try {
        await factory.methods.set(3, 'ipfsHash').send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }
      
      assert.ok(revert instanceof Error);
    });
  });

  describe('Function: setRole(uint256 _role)', () => {
    it('allows a user to update role from Regular to Organization', async () => {
      const initialRole = regularUser[0];
      await factory.methods.setRole(2).send({ from: accounts[1], gas: '1000000' });
      regularUser = await factory.methods.getUser(accounts[1]).call();
      const finalRole = regularUser[0];

      assert.notEqual(initialRole, finalRole);
    });

    it('allows a user to update role from Organization to Regular', async() => {
      const initialRole = organizationUser[0];
      await factory.methods.setRole(2).send({ from: accounts[2], gas: '1000000' });
      organizationUser = await factory.methods.getUser(accounts[1]).call();
      const finalRole = organizationUser[0];

      assert.notEqual(initialRole, finalRole);
    });

    it('does not allow a user to update role to Moderator', async() => {
      const initialRole = organizationUser[0];
      await factory.methods.setRole(2).send({ from: accounts[2], gas: '1000000' });
      organizationUser = await factory.methods.getUser(accounts[1]).call();
      const finalRole = organizationUser[0];

      assert.notEqual(initialRole, finalRole);
    });
  });

  describe('Function: setProfile(string _profile)', () => {
    it('allows a user to update profile', async () => {
      const initialProfile = regularUser[1];
      await factory.methods.setProfile('newIpfsHash').send({ from: accounts[1], gas: '1000000' });
      regularUser = await factory.methods.getUser(accounts[1]).call();
      const finalProfile = regularUser[1];

      assert.notEqual(initialProfile, finalProfile);
    });
  });

  describe('Function: deleteRegular()', () => {
    it('allows users to delete their profile and all associations with it', async () => {
      // first add regularUser to organizationUser
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      // then add regularUser as manager of the organization
      await factory.methods.organizationAddManagers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });

      const initialRole = regularUser[0];
      const initialIpfsHash = regularUser[1];
      const initialMemberOf = await factory.methods.memberOf(accounts[1]).call();
      const initialMemberIndex = await factory.methods.memberIndex(accounts[1]).call();
      const initialManagerOf = await factory.methods.managerOf(accounts[1]).call();

      // user deletes itself
      await factory.methods.deleteRegular().send({ from: accounts[1], gas: '1000000' });

      // get profile again
      regularUser = await factory.methods.getUser(accounts[1]).call();
      const finalRole = regularUser[0];
      const finalIpfsHash = regularUser[1];
      const finalMemberOf = await factory.methods.memberOf(accounts[1]).call();
      const finalMemberIndex = await factory.methods.memberIndex(accounts[1]).call();
      const finalManagerOf = await factory.methods.managerOf(accounts[1]).call();

      assert.notEqual(initialRole, finalRole);
      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.notEqual(initialMemberOf, finalMemberOf);
      assert.equal(initialMemberIndex, finalMemberIndex);
      assert.notEqual(initialManagerOf, finalManagerOf);
    });
  });
});