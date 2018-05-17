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

describe('Contract: PostSet', () => {
  describe('Function: setHash(uint256 _postId, string _newHash)', () => {
    it('should revert when not called by the postOwner or Moderator', async () => {
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.setHash(0, 'newIpfsHash').send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should update the post\'s ipfsHash (called by postOwner)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialIpfsHash = packedData[0];

      await factory.methods.setHash(0, 'newIpfsHash').send({ from: accounts[1], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalIpfsHash = packedData[0];
      
      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.equal('newIpfsHash', finalIpfsHash);
    });

    it('should update the post\'s ipfsHash (called by Moderator)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialIpfsHash = packedData[0];

      await factory.methods.setHash(0, 'newIpfsHash').send({ from: accounts[0], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalIpfsHash = packedData[0];
      
      assert.notEqual(initialIpfsHash, finalIpfsHash);
      assert.equal('newIpfsHash', finalIpfsHash);
    });
  });

  describe('Function: setViewPrice(uint256 _postId, uint256 _newViewPrice)', () => {
    it('should revert when not called by the postOwner or Moderator', async () => {
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.setViewPrice(0, 999).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should update the post\'s viewPrice (called by postOwner)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPrice = Number(packedData[2]);

      await factory.methods.setViewPrice(0, 999).send({ from: accounts[1], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPrice = Number(packedData[2]);

      assert.notEqual(initialViewPrice, finalViewPrice);
      assert.equal(999, finalViewPrice);
    });

    it('should update the post\'s viewPrice (called by Moderator)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPrice = Number(packedData[2]);

      await factory.methods.setViewPrice(0, 999).send({ from: accounts[0], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPrice = Number(packedData[2]);

      assert.notEqual(initialViewPrice, finalViewPrice);
      assert.equal(999, finalViewPrice);
    });
  });

  describe('Function: setViewPricePercentage(uint256 _postId, uint256 _newViewPricePercentage)', () => {
    it('should revert when not called by the postOwner or Moderator', async () => {
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.setViewPricePercentage(0, 15).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should update the post\'s viewPricePercentage (called by postOwner)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPricePercentage = Number(packedData[3]);

      await factory.methods.setViewPricePercentage(0, 15).send({ from: accounts[1], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPricePercentage = Number(packedData[3]);

      assert.notEqual(initialViewPricePercentage, finalViewPricePercentage);
      assert.equal(15, finalViewPricePercentage);
    });

    it('should update the post\'s viewPricePercentage (called by Moderator)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPricePercentage = Number(packedData[3]);

      await factory.methods.setViewPricePercentage(0, 15).send({ from: accounts[0], gas: '1000000' });

      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPricePercentage = Number(packedData[3]);

      assert.notEqual(initialViewPricePercentage, finalViewPricePercentage);
      assert.equal(15, finalViewPricePercentage);
    });
  });

  describe('Function: setPost(uint256 _postId, string _newHash, uint256 _newViewPrice, uint256 _newViewPricePercentage)', () => {
    it('should revert when not called by the postOwner or Moderator', async () => {
      await factory.methods.set(1, 'ipfsHash').send({ from: accounts[2], gas: '1000000' });

      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      let revert;

      try {
        await factory.methods.setPost(0, 'newIpfsHash', 999, 15).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });

    it('should update the post\'s values (called by postOwner)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      // get values before updating post
      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPrice = Number(packedData[2]);
      const initialViewPricePercentage = Number(packedData[3]);
      const initialIpfsHash = await factory.methods.postHashes(0).call();

      // update post
      await factory.methods.setPost(0, 'newIpfsHash', 55, 15).send({ from: accounts[1], gas: '1000000' });

      // get values after updating post
      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPrice = Number(packedData[2]);
      const finalViewPricePercentage = Number(packedData[3]);
      const finalIpfsHash = await factory.methods.postHashes(0).call();
    });

    it('should update the post\'s values (called by Moderator)', async () => {
      // post will have id 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      // get values before updating post
      let packedData = await factory.methods.unpackPost(0).call();
      const initialViewPrice = Number(packedData[2]);
      const initialViewPricePercentage = Number(packedData[3]);
      const initialIpfsHash = await factory.methods.postHashes(0).call();

      // update post
      await factory.methods.setPost(0, 'newIpfsHash', 55, 15).send({ from: accounts[0], gas: '1000000' });

      // get values after updating post
      packedData = await factory.methods.unpackPost(0).call();
      const finalViewPrice = Number(packedData[2]);
      const finalViewPricePercentage = Number(packedData[3]);
      const finalIpfsHash = await factory.methods.postHashes(0).call();
    });
  });
});