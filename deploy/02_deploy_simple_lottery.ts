import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying SimpleLottery contract...");

  const deployedLottery = await deploy("SimpleLottery", {
    from: deployer,
    log: true,
    value: ethers.parseEther("0.1"), // Initial prize pool
  });

  console.log(`SimpleLottery contract deployed at: ${deployedLottery.address}`);
  console.log(`Initial prize pool: 0.1 ETH`);
  console.log(`Deployment successful on network: ${hre.network.name}`);
};

export default func;
func.id = "deploy_simple_lottery";
func.tags = ["SimpleLottery"];
