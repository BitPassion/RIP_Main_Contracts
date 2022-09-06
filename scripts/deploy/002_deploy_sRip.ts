import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const deployed = await deploy(CONTRACTS.sRip, {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address}`,
    );
};

func.tags = [CONTRACTS.rip, "staking", "tokens"];
export default func;
