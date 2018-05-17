const assert = require('chai').assert,
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    owner,
    ownerProfile,
    regular,
    organization,
    moderator;


beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  owner = await factory.methods.owner().call();
  ownerProfile = await factory.methods.getUser(owner).call();

  await factory.methods.ownerSet(accounts[1], 1, 'ipfsHash').send({ from: owner, gas: '1000000' });
  regular = await factory.methods.getUser(accounts[1]).call();
  await factory.methods.ownerSet(accounts[2], 2, 'ipfsHash').send({ from: owner, gas: '1000000' });
  organization = await factory.methods.getUser(accounts[2]).call();
  await factory.methods.ownerSet(accounts[7], 3, 'ipfsHash').send({ from: owner, gas: '1000000' });
  moderator = await factory.methods.getUser(accounts[7]).call();
});

describe('Contract: UserOwner', () => {
  describe('Function: ownerSet(address _user, uint256 _role, string _profile)', () => {
    it('should revert when called by a Regular user', async () => {
      let revert;

      try {
        await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by an Organization user', async () => {
      let revert;

      try {
        await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by a Moderator user', async () => {
      let revert;

      try {
        await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: accounts[7], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow the contract Owner to create a user', async () => {
      let newUser = await factory.methods.getUser(accounts[5]).call();
      const initialRole = newUser[0];
      const initialIpfsHash = newUser[1];

      await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: owner, gas: '1000000' });

      newUser = await factory.methods.getUser(accounts[5]).call();
      const finalRole = newUser[0];
      const finalIpfsHash = newUser[1];

      assert.notEqual(initialRole, finalRole);
      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.equal(1, finalRole);
      assert.equal('ipfsHash', finalIpfsHash);
    });
  });

  describe('Function: ownerSetRole(address _user, uint256 _role)', () => {
    it('should revert when called by a Regular user', async () => {
      let revert;
      await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: owner, gas: '1000000' });

      try {
        await factory.methods.ownerSetRole(accounts[5], 1).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by an Organization user', async () => {
      let revert;
      await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: owner, gas: '1000000' });

      try {
        await factory.methods.ownerSetRole(accounts[5], 1).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by a Moderator user', async () => {
      let revert;
      await factory.methods.ownerSet(accounts[5], 1, 'ipfsHash').send({ from: owner, gas: '1000000' });

      try {
        await factory.methods.ownerSetRole(accounts[5], 1).send({ from: accounts[7], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow the contract Owner to update a user\'s role', async () => {
      const initialRole = regular[0];

      await factory.methods.ownerSetRole(accounts[1], 3).send({ from: owner, gas: '1000000' });

      regular = await factory.methods.getUser(accounts[1]).call();
      const finalRole = regular[0];

      assert.notEqual(initialRole, finalRole);
      // assert.equal(3, finalRole);
    });
  });

  describe('Function: ownerDeleteModerator(address _moderator)', () => {
    it('should revert when called by a Regular user', async () => {
      let revert;
      
      try {
        await factory.methods.ownerDeleteModerator(accounts[7]).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by an Organization user', async () => {
      let revert;

      try {
        await factory.methods.ownerDeleteModerator(accounts[7]).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should revert when called by a Moderator user', async () => {
      let revert;

      try {
        await factory.methods.ownerDeleteModerator(accounts[7]).send({ from: accounts[7], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should allow the contract Owner to delete a Moderator user', async () => {
      const initialRole = moderator[0];

      await factory.methods.ownerDeleteModerator(accounts[7]).send({ from: owner, gas: '1000000' });

      moderator = await factory.methods.getUser(accounts[7]).call();
      const finalRole = moderator[0];

      assert.notEqual(initialRole, finalRole);
      assert.equal(0, finalRole);
    });
  });
});