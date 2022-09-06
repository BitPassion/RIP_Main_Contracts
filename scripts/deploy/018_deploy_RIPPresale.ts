import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { Contract } from "ethers";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: any[] = [];

  // const deployed = await deploy(CONTRACTS.presale, {
  //   from: deployer,
  //   args,
  //   log: true,
  //   skipIfAlreadyDeployed: true,
  // });

  // console.log("RIPPresale: " + deployed.address);
  // console.log(`To verify: npx hardhat verify ${deployed.address}`);
};

func.tags = [CONTRACTS.presale, "RIPPresale"];
func.dependencies = [];

export default func;
