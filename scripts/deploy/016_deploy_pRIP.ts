import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args: any[] = [];

  // const deployed = await deploy(CONTRACTS.pRIP, {
  //   from: deployer,
  //   args,
  //   log: true,
  // skipIfAlreadyDeployed: true,
  //   // gasPrice: utils.hexlify(utils.parseUnits("40", "gwei")),
  // });

  // console.log("pOHM: " + deployed.address);
  // console.log(`To verify: npx hardhat verify ${deployed.address}`);
};

func.tags = [CONTRACTS.pRIP, "pRIP"];
func.dependencies = [];

export default func;
