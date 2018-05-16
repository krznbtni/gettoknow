const assert = require('chai').assert,
      ganache = require('ganache-cli'),
      Web3 = require('web3'),
      web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/Factory.json');

let accounts,
    factory,
    owner,
    ownerProfile;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '5000000' });

  owner = await factory.methods.owner().call();
  ownerProfile = await factory.methods.getUser(accounts[0]).call();
});

describe('Contract: Factory', () => {
  it('deploys a factory', () => {
    assert.ok(factory.options.address);
  });

  it('should assign accounts[0] as contract Owner', async () => {
    assert.equal(accounts[0], owner);
  });

  it('should create a Moderator profile for accounts[0] on deployment', async () => {
    const role = ownerProfile[0];
    assert.equal(3, role);
  });
});