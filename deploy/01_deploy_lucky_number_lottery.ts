import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying LuckyNumberLottery contract...");

  const deployedLottery = await deploy("LuckyNumberLottery", {
    from: deployer,
    log: true,
    value: ethers.parseEther("0.1"), // Initial prize pool
  });

  console.log(`LuckyNumberLottery contract deployed at: ${deployedLottery.address}`);
  console.log(`Initial prize pool: 0.1 ETH`);
  console.log(`Transaction hash: ${deployedLottery.transactionHash}`);
  console.log(`Transaction hash: ${deployedLottery.transactionHash}`);
};

export default func;
func.id = "deploy_lucky_number_lottery";
func.tags = ["LuckyNumberLottery"];
