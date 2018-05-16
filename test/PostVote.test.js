const assert = require('chai').assert,
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    owner,
    userOne;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  const gasEstimate = await web3.eth.estimateGas({ data: compiledFactory.bytecode });

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: gasEstimate });

  owner = await factory.methods.owner().call();

  await factory.methods.set(1, 'ipfsHash').send({ from: accounts[1], gas: '500000' });
  userOne = await factory.methods.getUser(accounts[1]).call();
});

describe('Contract: PostVote', () => {
  describe('Function: vote(uint256 _postId, bool _value)', () => {
    it('should not allow a non-registered user to call this function', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.vote(0, true).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }
      
      assert.ok(revert instanceof Error);
    });

    it('should increment up votes', async () => {
      // create an account for a second user
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialUpVotes = Number(packedData[4]);

      await factory.methods.vote(0, true).send({ from: accounts[2], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalUpVotes = Number(packedData[4]);

      assert.notEqual(initialUpVotes, finalUpVotes);
      assert.strictEqual(0, initialUpVotes);
      assert.strictEqual(1, finalUpVotes);
    });

    it('should increment down votes', async () => {
      // create an account for a second user
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialDownVotes = Number(packedData[5]);

      await factory.methods.vote(0, false).send({ from: accounts[2], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalDownVotes = Number(packedData[5]);

      assert.notEqual(initialDownVotes, finalDownVotes);
      assert.strictEqual(0, initialDownVotes);
      assert.strictEqual(1, finalDownVotes);
    });
  });
});