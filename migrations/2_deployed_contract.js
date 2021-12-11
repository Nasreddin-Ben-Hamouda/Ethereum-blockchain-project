var Migrations = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
