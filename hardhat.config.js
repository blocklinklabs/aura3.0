require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

// Replace file reading with environment variable
const privateKey = process.env.WALLET_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
// npx hardhat ignition deploy ./ignition/modules/TherapyConsent.js --network emvOnFlow
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      chainId: 4202,
    },
    emvOnFlow: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [privateKey],
      gasPrice: 1000000000,
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  allowUnlimitedContractSize: true,
  throwOnTransactionFailures: true,
  throwOnCallFailures: true,
  loggingEnabled: true,
};

// 0x92EECac0a67372fB4420FB61aAd28b77B335A790
// TherapyConsentModule#TherapyConsent - 0x92EECac0a67372fB4420FB61aAd28b77B335A790
