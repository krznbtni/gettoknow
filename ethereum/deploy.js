// https://gist.github.com/inovizz/1fdc2af0182584b90008e0cf2895554c
const Web3 = require('web3'),
      compiledFactory = require('./build/Factory.json');

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8501'),
      web3 = new Web3(provider);

const deploy = async () => {
  const factoryAbi = compiledFactory.interface;
  const factoryBytecode = '0x' + compiledFactory.bytecode;

  try {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account: ', accounts[0]);

    const gasEstimate = await web3.eth.estimateGas({ data: factoryBytecode });
    console.log('gasEstimate: ', gasEstimate);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
      .deploy({ data: '0x' + compiledFactory.bytecode })
      .send({ from: accounts[0], gas: gasEstimate });
    
    console.log('Contract deployed to: ', result.options.address);
  } catch (e) {
    console.log('error: ', e);
  }
}

deploy();