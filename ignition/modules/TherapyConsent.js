// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TherapyConsentModule", (m) => {
  // Deploy TherapyConsent contract
  // No constructor parameters needed for this contract
  const therapyConsent = m.contract("TherapyConsent", []);

  return { therapyConsent };
});
