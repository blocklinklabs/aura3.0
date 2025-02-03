require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
const fs = require("fs");
const privateKey = fs.readFileSync("secrete.txt").toString();
/** @type import('hardhat/config').HardhatUserConfig */
// npx hardhat ignition deploy ./ignition/modules/TherapyConsent.js --network emvOnFlow
module.exports = {
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      chainId: 31337,
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

// npx hardhat ignition deploy ./ignition/modules/Zero2Hero.js --network BitTorrent
