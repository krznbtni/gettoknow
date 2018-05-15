const assert = require('assert'),
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    regularUserOne, // accounts[1]
    regularUserTwo, // accounts [3]
    organizationUserOne, // accounts[2]
    organizationUserTwo // accounts[4]

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[1], gas: '1000000' });
  regularUserOne = await factory.methods.getUser(accounts[1]).call();

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[3], gas: '1000000' });
  regularUserTwo = await factory.methods.getUser(accounts[3]).call();

  await factory.methods.set(2, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });
  organizationUserOne = await factory.methods.getUser(accounts[2]).call();

  await factory.methods.set(2, 'ipfsHash').send({ from: accounts[4], gas: '1000000' });
  organizationUserTwo = await factory.methods.getUser(accounts[4]).call();
});

describe('Contract: UserOrganization', () => {

  describe('Function: organizationAddMembers(address[] _toAdd)', () => {
    it('should not allow a Regular user to add members', async () => {
      let revert;

      try {
        await factory.methods.organizationAddMembers([accounts[2]]).send({ from: accounts[1], gas: '1000000 '});
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to add another Organization as member', async () => {
      let revert;
      
      try {
        await factory.methods.organizationAddMembers([accounts[4]]).send({ from: accounts[2], gas: '1000000 '});
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to add a user which is already a member of another Organization', async () => {
      let revert;
      
      // organizationUserOne adds regularUserOne
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000 '});

      try {
        // organizationUserTwo tries to add regularUserOne
        await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[4], gas: '1000000 '});
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow an Organization to add members', async () => {
      // get the organization's initial members
      const initialMembers = organizationUserOne[2];

      // add regularUserOne to organizationUserOne
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });

      // get the new profile
      organizationUserOne = await factory.methods.getUser(accounts[2]).call();

      // get the organization's final members
      const finalMembers = organizationUserOne[2];
      const finalMembersLength = organizationUserOne[2].length;

      // get the user's memberOf
      const memberOf = await factory.methods.memberOf(accounts[1]).call();

      assert.equal(memberOf, accounts[2]);
      assert.equal(1, finalMembersLength);
      assert.notEqual(initialMembers, finalMembers);
    });

    it('should not allow a non-manager to add a member', async () => {
      let revert;
      
      // add regularUserOne (accounts[1]) to the Organization
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });

      try {
        // try to add regularUserTwo from regularUserOne
        await factory.methods.organizationAddMembers([accounts[3]]).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow an Organization manager to add a member', async () => {
      // add regularUserOne (accounts[1]) to the Organization
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });

      // make regularUserOne a manager
      await factory.methods.organizationAddManager(accounts[1]).send({ from: accounts[2], gas: '1000000' });

      // add regularUserTwo from regularUserOne (now a manager)
      await factory.methods.organizationAddMembers([accounts[3]]).send({ from: accounts[1], gas: '1000000' });

      let memberOf = await factory.methods.memberOf(accounts[3]).call();

      assert.equal(memberOf, accounts[2]);
    });
  });

  describe('Function: organizationRemoveMembers(address[] _toRemove)', () => {
    it('should not allow a Regular (non-member) to remove members', async () => {
      let revert;
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });

      try {
        await factory.methods.organizationRemoveMembers([accounts[1]]).send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow to remove non-existing members', async () => {
      let revert;

      try {
        await factory.methods.organizationRemoveMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow a non-manager to remove members', async () => {
      let revert;
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      await factory.methods.organizationAddMembers([accounts[3]]).send({ from: accounts[2], gas: '1000000' });

      try {
        await factory.methods.organizationRemoveMembers([accounts[3]]).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow an Organization to remove members', async () => {
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      await factory.methods.organizationAddMembers([accounts[3]]).send({ from: accounts[2], gas: '1000000' });

      let initialMemberOf = await factory.methods.memberOf(accounts[3]).call();
      
      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let initialMembers = organizationUserOne[2];

      await factory.methods.organizationRemoveMembers([accounts[3]]).send({ from: accounts[2], gas: '1000000' });

      let finalMemberOf = await factory.methods.memberOf(accounts[3]).call();
      let finalMemberIndex = await factory.methods.memberIndex(accounts[3]).call();

      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let finalMembers = organizationUserOne[2];

      assert.notEqual(initialMemberOf, finalMemberOf);
      assert.notEqual(initialMembers, finalMembers);
      assert.equal(0, finalMemberIndex);
    });

    it('should allow a manager to remove members', async () => {
      await factory.methods.organizationAddMembers([accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      await factory.methods.organizationAddMembers([accounts[3]]).send({ from: accounts[2], gas: '1000000' });
      await factory.methods.organizationAddManager(accounts[1]).send({ from: accounts[2], gas: '1000000' });

      let initialMemberOf = await factory.methods.memberOf(accounts[3]).call();

      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let initialMembers = organizationUserOne[2];

      await factory.methods.organizationRemoveMembers([accounts[3]]).send({ from: accounts[1], gas: '1000000' });

      let finalMemberOf = await factory.methods.memberOf(accounts[3]).call();
      let memberIndex = await factory.methods.memberIndex(accounts[3]).call();

      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let finalMembers = organizationUserOne[2];

      assert.notEqual(initialMemberOf, finalMemberOf);
      assert.notEqual(initialMembers, finalMembers);
      assert.equal(0, memberIndex);
    });
  });

  describe('Function: organizationAddManager(address _user)', () => {
    
  });

  // describe('Function: organizationRemoveManager(address _user)', () => { });

  // describe('Function: deleteOrganization()', () => { });

});