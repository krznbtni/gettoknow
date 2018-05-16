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

describe('Contract: PostView', () => {
  describe('Function: viewPost(uint256 _postId)', () => {
    describe('Function: _payViewer(uint256 _postId)', () => {
      it('should not allow a payout twice to the same user', async () => {
        let revert;

        // create post with 1 eth
        await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

        // watch once from accounts[2]
        await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });

        // watch again from accounts[2]
        try {
          await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
      });

      it('should revert when the post\'s balance is less than the viewPrice', async () => {
        let revert;

        // create post with 10 wei
        await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: 10 });
        
        // watch from accounts[2]
        try {
          await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });
        } catch (e) {
          revert = e;
        }
        
        assert.ok(revert instanceof Error);
      });

      it('should subtract the viewPrice from the post\'s balance', async () => {
        // create post with 1000 wei
        await factory.methods.createPost('ipfsHash', 100, 0).send({ from: accounts[1], gas: '1000000', value: 1000 });

        // get initial balance
        let unpackedData = await factory.methods.unpackPost(0).call();
        const initialBalance = Number(unpackedData[1]);
        
        // view from accounts[2]
        await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });

        // get final balance
        unpackedData = await factory.methods.unpackPost(0).call();
        const finalBalance = Number(unpackedData[1]);

        assert.isBelow(finalBalance, initialBalance);
        assert.equal(900, finalBalance);
      });

      it('should transfer viewPrice to viewer', async () => {
        // create post with 0.5 eth as view price
        await factory.methods.createPost('ipfsHash', web3.utils.toWei('0.5', 'ether'), 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

        // get initial balance
        let initialViewerBalance = await web3.eth.getBalance(accounts[2]);
        initialViewerBalance = Number(initialViewerBalance);

        // view from accounts[2]
        await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });

        // get final balance
        let finalViewerBalance = await web3.eth.getBalance(accounts[2]);
        finalViewerBalance = Number(finalViewerBalance);

        assert.isAbove(finalViewerBalance, initialViewerBalance);
      });
    });

    describe('Function: _storeView(uint256 _postId)', () => {
      it('should assign the value of hasViewed (mapping) to true', async () => {
        let initialHasViewed = await factory.methods.hasViewed(0,accounts[2]).call();
        
        await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });

        let finalHasViewed = await factory.methods.hasViewed(0,accounts[2]).call();

        assert.strictEqual(initialHasViewed, false);
        assert.strictEqual(true, finalHasViewed);
      });

      it('should fire events which will be used to count the number of views', async () => {
        // create post with 0.5 eth as view price
        await factory.methods.createPost('ipfsHash', web3.utils.toWei('0.5', 'ether'), 0).send({ from: accounts[1], gas: '1000000', value: web3.utils.toWei('1', 'ether') });

        // view the post twice
        await factory.methods.viewPost(0).send({ from: accounts[2], gas: '1000000' });
        await factory.methods.viewPost(0).send({ from: accounts[3], gas: '1000000' });

        // catch all 'OnView' events from block 0
        const OnView = await factory.getPastEvents('OnView', {
          filter: { postId: 0 },
          fromBlock: 0,
          toBlock: 'latest'
        });

        let viewCount = 0;

        for (let view in OnView) {
          viewCount++;
        }

        assert.equal(2, viewCount);
      });
    });
  });
});