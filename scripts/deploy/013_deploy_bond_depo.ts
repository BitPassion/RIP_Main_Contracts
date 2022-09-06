import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const authorityDeployment = await deployments.get(CONTRACTS.authority);
  const ripDeployment = await deployments.get(CONTRACTS.rip);
  const gRipDeployment = await deployments.get(CONTRACTS.gRip);
  const stakingDeployment = await deployments.get(CONTRACTS.staking);
  const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

  const args: any[] = [authorityDeployment.address, ripDeployment.address, gRipDeployment.address, stakingDeployment.address, treasuryDeployment.address];

  const deployed = await deploy(CONTRACTS.bondDepo, {
    from: deployer,
    args,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  console.log("Bond DepoV2: " + deployed.address);
  console.log(`To verify: npx hardhat verify ${deployed.address} ${authorityDeployment.address} ${ripDeployment.address} ${gRipDeployment.address} ${stakingDeployment.address} ${treasuryDeployment.address}`);
};

func.tags = [CONTRACTS.give, "redeem"];
func.dependencies = [];

export default func;
