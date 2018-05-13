// https://gist.github.com/inovizz/1fdc2af0182584b90008e0cf2895554c

const path = require('path'),
      solc = require('solc'),
      fs = require('fs-extra');

console.log('1');

const buildPath = path.resolve(__dirname, 'build'); // get the path to 'build' folder

console.log('2');

fs.removeSync(buildPath); // remove 'build' folder

console.log('3');

// Read Factory.sol
const factoryPath = path.resolve(__dirname, 'contracts', 'Factory.sol');

console.log('factoryPath: ', factoryPath);

console.log('4');

// read in source code
const source = fs.readFileSync(factoryPath, 'utf8');

console.log('source: ', source);

console.log('5');

// compile
const output = solc.compile(source, 1);

console.log('output1: ', output);

// console.log('6');

// // create 'build' folder
// fs.ensureDirSync(buildPath);

// console.log('7');

// // write to a different file
// for (let contract in output) {
//   console.log('8');

//   console.log('output: ', output);
//   console.log('contract: ', contract);
  
//   fs.outputJsonSync(
//     path.resolve(buildPath, contract.replace(':', '') + '.json'),
//     output[contract]
//   );

//   console.log('9');
// }

// console.log('10');