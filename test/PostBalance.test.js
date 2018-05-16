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

describe('Contract: PostBalance', () => {
  describe('Function: deposit(uint256 _postId)', () => {
    it('should be payable', async () => {
      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000' });

      // deposit
      await factory.methods.deposit(0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });
    });

    it('should add the deposited amount to the post\'s balance', async () => {
      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000' });

      // get the post's initial balance
      let unpackedData = await factory.methods.unpackPost(0).call();
      const initialBalance = unpackedData[1];

      // deposit
      await factory.methods.deposit(0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      // get the post's final balance
      unpackedData = await factory.methods.unpackPost(0).call();
      const finalBalance = unpackedData[1];

      assert.equal(0, initialBalance);
      assert.equal(web3.utils.toWei('1', 'ether'), finalBalance);
      assert.notEqual(initialBalance, finalBalance);
    });
  });

  describe('Function: withdraw(uint256 _postId, uint256 _amount)', () => {
    it('should not allow any other than the postOwner to call this function', async () => {
      let revert;

      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      try {
        await factory.methods.withdraw(0, 500).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should not allow the postOwner to withdraw an amount that exceeds the post\'s balance', async () => {
      let revert;

      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      try {
        await factory.methods.withdraw(0, web3.utils.toWei('2', 'ether')).send({ from: accounts[1], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should subtract the withdrawn amount from the post\'s balance', async () => {
      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      // get the post's initial balance
      let unpackedData = await factory.methods.unpackPost(0).call();
      const initialBalance = unpackedData[1];

      await factory.methods.withdraw(0, web3.utils.toWei('1', 'ether')).send({ from: accounts[1], gas: '1000000' });

      // get the post's final balance
      unpackedData = await factory.methods.unpackPost(0).call();
      const finalBalance = unpackedData[1];

      assert.equal(web3.utils.toWei('1', 'ether'), initialBalance);
      assert.equal(0, finalBalance);
      assert.notEqual(initialBalance, finalBalance);
    });

    it('should send the withdrawn amount to the postOwner', async () => {
      // first create a post. Will receive postCount 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      // initial postOwner balance
      let initialOwnerBalance = await web3.eth.getBalance(accounts[1]);
      initialOwnerBalance = Number(initialOwnerBalance);

      // withdraw 1 eth
      await factory.methods.withdraw(0, web3.utils.toWei('1', 'ether')).send({ from: accounts[1], gas: '1000000' });

      let finalOwnerBalance = await web3.eth.getBalance(accounts[1]);
      finalOwnerBalance = Number(finalOwnerBalance);

      assert.isAbove(finalOwnerBalance, initialOwnerBalance);
    });
  });
});