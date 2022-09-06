import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);

  const args: any[] = [[], bondDepoDeployment.address];

  // const deployed = await deploy(CONTRACTS.bondHelper, {
  //   from: deployer,
  //   args,
  //   log: true,
        // skipIfAlreadyDeployed: true,
        //  // gasPrice: utils.hexlify(utils.parseUnits("40", "gwei")),
  // });
  // console.log("bondHelper deployed: ", deployed.address);
  // console.log(`To verify: npx hardhat verify ${deployed.address} ${[]} ${bondDepoDeployment.address}`);
};

func.tags = [CONTRACTS.give, "redeem"];
func.dependencies = [];

export default func;
