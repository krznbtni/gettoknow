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

describe('Contract: PostDelete', () => {

  describe('Function: deletePost(uint256 _postId)', () => {

    it('should revert when not called by the postOwner', async () => {
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.deletePost(0).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should transfer the post\'s balance to the postOwner', async () => {
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialPostBalance = Number(packedData[1]);
      const initialOwnerBalance = await Number(web3.eth.getBalance(accounts[1]));

      await factory.methods.deletePost(0).send({ from: accounts[1], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalPostBalance = Number(packedData[1]);
      const finalOwnerBalance = await Number(web3.eth.getBalance(accounts[1]));

      assert.notEqual(initialPostBalance, finalPostBalance);
      assert.notEqual(initialOwnerBalance, finalOwnerBalance);
    });

    it('should delete all post associations', async () => {
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });
      await factory.methods.vote(0, true).send({ from: accounts[2], gas: '1000000' });

      const initialBase = await factory.methods.base(0).call();
      const initialPostHash = await factory.methods.postHashes(0).call();
      const initialVotes = await factory.methods.votes(0).call();
      const initialPostOwner = await factory.methods.postOwner(0).call();

      await factory.methods.deletePost(0).send({ from: accounts[1], gas: '1000000' });

      const finalBase = await factory.methods.base(0).call();
      const finalPostHash = await factory.methods.postHashes(0).call();
      const finalVotes = await factory.methods.votes(0).call();
      const finalPostOwner = await factory.methods.postOwner(0).call();

      assert.notEqual(initialBase, finalBase);
      assert.notEqual(initialPostHash, finalPostHash);
      assert.notEqual(initialVotes, finalVotes);
      assert.notEqual(initialPostOwner, finalPostOwner);
    });

  });

});