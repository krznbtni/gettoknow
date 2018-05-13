const path = require('path'),
      fs = require('fs-extra'),
      solc = require('solc');

console.log('1');

const buildPath = path.resolve(__dirname, 'build');

console.log('2');

fs.removeSync(buildPath);

console.log('3');

const DataPacking = path.resolve(__dirname, 'contracts/libraries', 'DataPacking.sol'),
      SafeMath = path.resolve(__dirname, 'contracts/libraries', 'SafeMath.sol'),
      Ownable = path.resolve(__dirname, 'contracts/libraries', 'Ownable.sol'),
      Users = path.resolve(__dirname, 'contracts/libraries', 'Users.sol'),
      UserGeneral = path.resolve(__dirname, 'contracts/user', 'UserGeneral.sol'),
      UserModerator = path.resolve(__dirname, 'contracts/user', 'UserModerator.sol'),
      UserOrganization = path.resolve(__dirname, 'contracts/user', 'UserOrganization.sol'),
      UserRegular = path.resolve(__dirname, 'contracts/user', 'UserRegular.sol'),
      PostStorage = path.resolve(__dirname, 'contracts/post', 'PostStorage.sol'),
      PostBalance = path.resolve(__dirname, 'contracts/post', 'PostBalance.sol'),
      PostView = path.resolve(__dirname, 'contracts/post', 'PostView.sol'),
      PostVote = path.resolve(__dirname, 'contracts/post', 'PostVote.sol'),
      PostSet = path.resolve(__dirname, 'contracts/post', 'PostSet.sol'),
      PostDelete = path.resolve(__dirname, 'contracts/post', 'PostDelete.sol'),
      Factory = path.resolve(__dirname, 'contracts', 'Factory.sol');

console.log('4');

const input = {
  'DataPacking.sol': fs.readFileSync(DataPacking, 'utf8'),
  'SafeMath.sol': fs.readFileSync(SafeMath, 'utf8'),
  'Ownable.sol': fs.readFileSync(Ownable, 'utf8'),
  'Users.sol': fs.readFileSync(Users, 'utf8'),
  'UserGeneral.sol': fs.readFileSync(UserGeneral, 'utf8'),
  'UserModerator.sol': fs.readFileSync(UserModerator, 'utf8'),
  'UserOrganization.sol': fs.readFileSync(UserOrganization, 'utf8'),
  'UserRegular.sol': fs.readFileSync(UserRegular, 'utf8'),
  'PostStorage.sol': fs.readFileSync(PostStorage, 'utf8'),
  'PostBalance.sol': fs.readFileSync(PostBalance, 'utf8'),
  'PostView.sol': fs.readFileSync(PostView, 'utf8'),
  'PostVote.sol': fs.readFileSync(PostVote, 'utf8'),
  'PostSet.sol': fs.readFileSync(PostSet, 'utf8'),
  'PostDelete.sol': fs.readFileSync(PostDelete, 'utf8'),
  'Factory.sol': fs.readFileSync(Factory, 'utf8')
};

console.log('5');

const output = solc.compile({sources: input}, 1);

console.log('6, output: ', output);