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

describe('Contract: PostStorage', () => {

  describe('Function: createPost(string _hash, uint256 _viewPrice, uint256 _viewPricePercentage)', () => {
    it('should not allow an UNSET user to create a post', async () => {
      let revert;

      try {
        await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[2], gas: '1000000' });
      } catch (e) {
        revert = e;
      }

      assert.ok(revert instanceof Error);
    });
    
    it('should create a post and push the ipfs hash into the postHashes array', async () => {
      // create from userOne
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000' });

      // get postHashes[0]
      const indexOne = await factory.methods.postHashes(0).call();
      
      assert.equal('ipfsHash', indexOne);
    });
    
    it('should create a post set function caller as postOwner', async () => {
      // create from userOne
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000' });

      // get postOwner[0]
      const postOwner = await factory.methods.postOwner(0).call();

      assert.equal(accounts[1], postOwner);
    });

    it('should be payable', async () => {
      // 'gas' is needed because otherwise it might fail depending on the function
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });
    });

    it('should pack the data into one (1) bytes32 variable and assign base (mapping) to the correct post', async () => {
      // starts at 0
      const initialBase = await factory.methods.base(0).call();

      // will get postCount = 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      const finalBase = await factory.methods.base(0).call();
      
      assert.notEqual(initialBase, finalBase);
    });

    it('should iterate the postCount', async () => {
      const initialPostCount = await factory.methods.postCount().call();

      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      const finalPostCount = await factory.methods.postCount().call();

      assert.notEqual(initialPostCount, finalPostCount);
      assert.equal(1, finalPostCount);
    });
  });

  describe('Function: unpackPost', () => {
    it('should unpack the data and return the values', async () => {
      // gets postCount = 0
      await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

      const unpackedData = await factory.methods.unpackPost(0).call();
      const ipfsHash = unpackedData[0],
            balance = unpackedData[1],
            viewPrice = unpackedData[2],
            viewPricePercentage = unpackedData[3],
            upVotes = unpackedData[4],
            downVotes = unpackedData[5];

      assert.equal('ipfsHash', ipfsHash);
      assert.equal(web3.utils.toWei('1', 'ether'), balance);
      assert.equal(100, viewPrice);
      assert.equal(0, viewPricePercentage);
      assert.equal(0, upVotes);
      assert.equal(0, downVotes);
    });
  });


});