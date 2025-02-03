// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = 1_000_000_000n;

module.exports = buildModule("TherapyConsentModule", (m) => {
  // Deploy the TherapyConsent contract
  // No constructor parameters are needed for this contract
  const therapyConsent = m.contract("TherapyConsent", []);

  return { therapyConsent };
});
