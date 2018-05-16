const assert = require('chai').assert,
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    moderator,
    regularUserOne, // accounts[1]
    regularUserTwo, // accounts [3]
    organizationUserOne, // accounts[2]
    organizationUserTwo // accounts[4]

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  moderator = await factory.methods.getUser(accounts[0]).call();

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[1], gas: '1000000' });
  regularUserOne = await factory.methods.getUser(accounts[1]).call();

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[3], gas: '1000000' });
  regularUserTwo = await factory.methods.getUser(accounts[3]).call();

  await factory.methods.set(2, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });
  organizationUserOne = await factory.methods.getUser(accounts[2]).call();

  await factory.methods.set(2, 'ipfsHash').send({ from: accounts[4], gas: '1000000' });
  organizationUserTwo = await factory.methods.getUser(accounts[4]).call();
});

describe('Contract: UserModerator', () => {
  it('should create a Moderator profile for accounts[0] on deployment', async () => {
    const role = moderator[0];
    assert.equal(3, role);
  });

  describe('Function: moderatorSet(address _user, uint256 _role, string _profile)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSet(accounts[5], 2).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSet(accounts[5], 2).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow a Moderator to create a Regular user', async () => {
      await factory.methods.moderatorSet(accounts[5], 1, 'ipfsHash').send({ from: accounts[0], gas: '1000000' });
      const newRegular = await factory.methods.getUser(accounts[5]).call();
      const role = newRegular[0];
      const ipfsHash = newRegular[1];

      assert.equal(role, 1);
      assert.equal(ipfsHash, 'ipfsHash');
    });

    it('should allow a Moderator to create an Organization user', async () => {
      await factory.methods.moderatorSet(accounts[5], 2, 'ipfsHash').send({ from: accounts[0], gas: '1000000' });
      const newRegular = await factory.methods.getUser(accounts[5]).call();
      const role = newRegular[0];
      const ipfsHash = newRegular[1];

      assert.equal(role, 2);
      assert.equal(ipfsHash, 'ipfsHash');
    });

    it('should allow a Moderator to create a Moderator user', async () => {
      await factory.methods.moderatorSet(accounts[5], 3, 'ipfsHash').send({ from: accounts[0], gas: '1000000' });
      const newRegular = await factory.methods.getUser(accounts[5]).call();
      const role = newRegular[0];
      const ipfsHash = newRegular[1];

      assert.equal(role, 3);
      assert.equal(ipfsHash, 'ipfsHash');
    });
  });

  describe('Function: moderatorSetRole(address _user, uint256 _role)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSetRole(accounts[1], 2).send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSetRole(accounts[1], 2).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow a Moderator to set a user\'s role to UNSET (0)', async () => {
      let revert;

      try {
        await factory.methods.moderatorSetRole(accounts[1], 0).send({ from: accounts[0], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow a Moderator to update a user\'s role', async () => {
      const initialRole = regularUserOne[0];

      await factory.methods.moderatorSetRole(accounts[1], 2).send({ from: accounts[0], gas: '1000000' });
      
      regularUserOne = await factory.methods.getUser(accounts[1]).call();
      const finalRole = regularUserOne[0];

      assert.notEqual(initialRole, finalRole);
      assert.equal(finalRole, 2);
    });
  });

  describe('Function: moderatorSetProfile(address _user, string _profile)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSetProfile(accounts[1], 'newIpfsHash').send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorSetProfile(accounts[1], 'newIpfsHash').send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow a Moderator to update a user\'s ipfs profile hash', async () => {
      const initialIpfsHash = regularUserOne[1];

      await factory.methods.moderatorSetProfile(accounts[1], 'newIpfsHash').send({ from: accounts[0], gas: '1000000' });
      
      regularUserOne = await factory.methods.getUser(accounts[1]).call();
      const finalIpfsHash = regularUserOne[1];

      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.equal(finalIpfsHash, 'newIpfsHash');
    });
  });

  describe('Function: moderatorAddMember(address _organization, address[] _toAdd)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorAddMembers(accounts[2], [accounts[1]]).send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorAddMembers(accounts[2], [accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow a Moderator to add a user who is already a member of another Organization', async () => {
      let revert;
      
      // organizationUserOne adds regularUserOne
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1]]).send({ from: accounts[0], gas: '1000000 '});

      try {
        // organizationUserTwo tries to add regularUserOne
        await factory.methods.moderatorAddMembers(accounts[4], [accounts[1]]).send({ from: accounts[0], gas: '1000000 '});
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow a Moderator to add another Organization as member', async () => {
      let revert;
      
      try {
        await factory.methods.moderatorAddMembers(accounts[2], [accounts[4]]).send({ from: accounts[0], gas: '1000000 '});
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow a Moderator to add members to an Organization', async () => {
      // get the organization's initial members
      const initialMembers = organizationUserOne[2];

      // add regularUserOne to organizationUserOne
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1]]).send({ from: accounts[0], gas: '1000000 '});

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
  });

  describe('Function: moderatorRemoveMember(address _organization, address[] _toRemove)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1], accounts[3]]).send({ from: accounts[0], gas: '1000000' });

      try {
        await factory.methods.moderatorRemoveMembers(accounts[2], [accounts[1]]).send({ from: accounts[3], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1], accounts[3]]).send({ from: accounts[0], gas: '1000000' });

      try {
        await factory.methods.moderatorRemoveMembers(accounts[2], [accounts[1]]).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow a Moderator to remove non-existing members', async () => {
      let revert;

      try {
        await factory.methods.moderatorRemoveMembers(accounts[2], [accounts[1]]).send({ from: accounts[0], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow a Moderator to remove members from an Organization', async () => {
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1], accounts[3]]).send({ from: accounts[0], gas: '1000000' });
      await factory.methods.organizationAddManager(accounts[3]).send({ from: accounts[2], gas: '1000000' });

      let initialMemberOf = await factory.methods.memberOf(accounts[3]).call();
      let initialManagerOf = await factory.methods.managerOf(accounts[3]).call();
      
      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let initialMembers = organizationUserOne[2];

      await factory.methods.moderatorRemoveMembers(accounts[2], [accounts[3]]).send({ from: accounts[0], gas: '1000000' });

      let finalMemberOf = await factory.methods.memberOf(accounts[3]).call();
      let finalManagerOf = await factory.methods.managerOf(accounts[3]).call();
      let finalMemberIndex = await factory.methods.memberIndex(accounts[3]).call();

      organizationUserOne = await factory.methods.getUser(accounts[2]).call();
      let finalMembers = organizationUserOne[2];

      assert.notEqual(initialMemberOf, finalMemberOf);
      assert.notEqual(initialManagerOf, finalManagerOf);
      assert.notEqual(initialMembers, finalMembers);
      assert.equal(0, finalMemberIndex);
    });
  });

  describe('Function: moderatorDeleteOrganization(address _organization)', () => {
    it('should not allow a Regular to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorDeleteOrganization(accounts[2]).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow an Organization to call this function', async () => {
      let revert;

      try {
        await factory.methods.moderatorDeleteOrganization(accounts[2]).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should, for every member, remove all associations with the Organization', async () => {
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1], accounts[3]]).send({ from: accounts[0], gas: '1000000' });
      await factory.methods.organizationAddManager(accounts[1]).send({ from: accounts[2], gas: '1000000' });

      // get initial member 1 (regularOne) values
      const initialMemberOfOne = await factory.methods.memberOf(accounts[1]).call();
      const initialMemberIndexOne = await factory.methods.memberIndex(accounts[1]).call();
      const initialManagerOfOne = await factory.methods.managerOf(accounts[1]).call();

      // get initial member 2 (regularTwo) values
      const initialMemberOfTwo = await factory.methods.memberOf(accounts[3]).call();
      const initialMemberIndexTwo = await factory.methods.memberIndex(accounts[3]).call();

      await factory.methods.moderatorDeleteOrganization(accounts[2]).send({ from: accounts[0], gas: '1000000' });

      // get final member 1 (regularOne) values
      const finalMemberOfOne = await factory.methods.memberOf(accounts[1]).call();
      const finalMemberIndexOne = await factory.methods.memberIndex(accounts[1]).call();
      const finalManagerOfOne = await factory.methods.managerOf(accounts[1]).call();

      // get final member 2 (regularTwo) values
      const finalMemberOfTwo = await factory.methods.memberOf(accounts[3]).call();
      const finalMemberIndexTwo = await factory.methods.memberIndex(accounts[3]).call();

      // check member 1 (regularOne)
      assert.notEqual(initialMemberOfOne, finalMemberOfOne);
      assert.ok(initialMemberIndexOne, finalMemberIndexOne);
      assert.notEqual(initialManagerOfOne, finalManagerOfOne);

      // check member 2 (regularTwo)
      assert.notEqual(initialMemberOfTwo, finalMemberOfTwo);
      assert.notEqual(initialMemberIndexTwo, finalMemberIndexTwo);
    });

    it('should remove the Organization profile', async () => {
      await factory.methods.moderatorAddMembers(accounts[2], [accounts[1], accounts[3]]).send({ from: accounts[0], gas: '1000000' });

      organizationOne = await factory.methods.getUser(accounts[2]).call();
      const initialRole = organizationOne[0];
      const initialIpfsHash = organizationOne[1];
      const initialMembers = organizationOne[2];

      await factory.methods.moderatorDeleteOrganization(accounts[2]).send({ from: accounts[0], gas: '1000000' });

      organizationOne = await factory.methods.getUser(accounts[2]).call();
      const finalRole = organizationOne[0];
      const finalIpfsHash = organizationOne[1];
      const finalMembers = organizationOne[2];

      assert.notEqual(initialRole, finalRole);
      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.notEqual(initialMembers, finalMembers);
    });

    
  });

  // describe('Function: moderatorDeleteRegular(address _user)', () => { });
});