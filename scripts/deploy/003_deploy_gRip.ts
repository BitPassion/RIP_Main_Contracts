import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const sRipDeployment = await deployments.get(CONTRACTS.sRip);

    const deployed = await deploy(CONTRACTS.gRip, {
        from: deployer,
        args: [deployer, sRipDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${deployer} ${sRipDeployment.address}`,
    );
};

func.tags = [CONTRACTS.gRip, "migration", "tokens"];
func.dependencies = [CONTRACTS.migrator];

export default func;
