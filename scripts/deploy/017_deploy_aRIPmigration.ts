import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { ARIPMigration__factory } from "../../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const accounts = await hre.ethers.getSigners();
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const RipDeployment = await deployments.get(CONTRACTS.rip);
  const aRIPDeployment = await deployments.get(CONTRACTS.aRIP);
  const swapDuration = 55000;
  const presaleAddress = "0x6A768C2BF98dB2204D53ceddb8d527c8386A9DbF"

  const args: any[] = [];

  const deployed = await deploy(CONTRACTS.aRIPMigration, {
    from: deployer,
    args,
    log: true,
  skipIfAlreadyDeployed: true,
  });

  console.log("aRIPMigration: " + deployed.address);
  console.log(`To verify: npx hardhat verify ${deployed.address}`);

  const migrationContract = ARIPMigration__factory.connect(deployed.address, accounts[0])
  await migrationContract.initialize(RipDeployment.address, aRIPDeployment.address, swapDuration, presaleAddress)
  console.log("aRIPMigration initialized");
};

func.tags = [CONTRACTS.aRIPMigration, "aRIPMigration"];
func.dependencies = [];

export default func;
