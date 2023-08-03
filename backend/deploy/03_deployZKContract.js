const { network } = require("hardhat");
const { deploymentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  args = [];

  const hasher = await deploy("Hasher", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  const verifier = await deploy("Groth16Verifier", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  await deploy("ZkContract", {
    from: deployer,
    args: [hasher.address, verifier.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};

module.exports.tags = ["all", "CreateNFT"];
