import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const stakingDeployment = await deployments.get(CONTRACTS.staking);
  const ripDeployment = await deployments.get(CONTRACTS.rip);

  const args: any[] = [stakingDeployment.address, ripDeployment.address];

  // const deployed = await deploy(CONTRACTS.stakingHelper, {
  //   from: deployer,
  //   args,
  //   log: true,
  //   skipIfAlreadyDeployed: true,
  //   //  // gasPrice: utils.hexlify(utils.parseUnits("40", "gwei")),
  // });
  // console.log("StakingHelper deployed: ", deployed.address);
  // console.log(`To verify: npx hardhat verify ${deployed.address} ${stakingDeployment.address} ${ripDeployment.address}`);
};

func.tags = [CONTRACTS.give, "redeem"];
func.dependencies = [];

export default func;
