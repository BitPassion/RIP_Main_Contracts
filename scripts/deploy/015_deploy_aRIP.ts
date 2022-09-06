import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: any[] = [];

  const deployed = await deploy(CONTRACTS.aRIP, {
    from: deployer,
    args,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  console.log(`aRIP: ${deployed.address}`);
  console.log(`To verify: npx hardhat verify ${deployed.address}`);
};

func.tags = [CONTRACTS.aRIP, "aRIP"];
func.dependencies = [];

export default func;
