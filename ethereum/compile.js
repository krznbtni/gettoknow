const path = require('path'),
      fs = require('fs-extra'),
      solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const input = {
  'DataPacking.sol': fs.readFileSync('./ethereum/contracts/DataPacking.sol', 'utf8'),
  'SafeMath.sol': fs.readFileSync('./ethereum/contracts/SafeMath.sol', 'utf8'),
  'Ownable.sol': fs.readFileSync('./ethereum/contracts/Ownable.sol', 'utf8'),
  'Users.sol': fs.readFileSync('./ethereum/contracts/Users.sol', 'utf8'),
  'UserGeneral.sol': fs.readFileSync('./ethereum/contracts/UserGeneral.sol', 'utf8'),
  'UserOwner.sol': fs.readFileSync('./ethereum/contracts/UserOwner.sol', 'utf8'),
  'UserModerator.sol': fs.readFileSync('./ethereum/contracts/UserModerator.sol', 'utf8'),
  'UserOrganization.sol': fs.readFileSync('./ethereum/contracts/UserOrganization.sol', 'utf8'),
  'UserRegular.sol': fs.readFileSync('./ethereum/contracts/UserRegular.sol', 'utf8'),
  'PostStorage.sol': fs.readFileSync('./ethereum/contracts/PostStorage.sol', 'utf8'),
  'PostBalance.sol': fs.readFileSync('./ethereum/contracts/PostBalance.sol', 'utf8'),
  'PostView.sol': fs.readFileSync('./ethereum/contracts/PostView.sol', 'utf8'),
  'PostVote.sol': fs.readFileSync('./ethereum/contracts/PostVote.sol', 'utf8'),
  'PostSet.sol': fs.readFileSync('./ethereum/contracts/PostSet.sol', 'utf8'),
  'PostDelete.sol': fs.readFileSync('./ethereum/contracts/PostDelete.sol', 'utf8'),
  'Factory.sol': fs.readFileSync('./ethereum/contracts/Factory.sol', 'utf8')
}

const output = solc.compile({sources: input}, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract + '.json'),
    output[contract]
  );
}