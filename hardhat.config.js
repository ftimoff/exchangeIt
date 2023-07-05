require('@nomiclabs/hardhat-waffle');
require('hardhat-contract-sizer');
require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gas: 12500000,
      blockGasLimit: 0x1fffffffffffff,
    },
    testnet: {
      url: 'https://rpc.testnet.fantom.network',
      chainId: 4002,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    mainnet: {
      url: 'https://rpcapi.fantom.network',
      chainId: 250,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100
      }
    }
  }
};
