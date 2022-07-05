require("@nomiclabs/hardhat-waffle");
require("./solcBuilds");

const settings = {
  optimizer: {
    enabled: false,
    runs: 0
  }
}

const versions = ["0.6.12", "0.7.5", "0.8.4"];

module.exports = {
  solidity: {
    compilers: versions.map((version) => ({ version, settings }))
  }
};