import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    const deployed = await deploy(CONTRACTS.rip, {
        from: deployer,
        args: [authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${authorityDeployment.address}`,
    );
};

func.tags = [CONTRACTS.rip, "staking", "tokens"];
func.dependencies = [CONTRACTS.authority];
export default func;
