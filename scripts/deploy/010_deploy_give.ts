import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const sRip = await deployments.get(CONTRACTS.sRip);

    const deployed = await deploy(CONTRACTS.give, {
        from: deployer,
        args: [
            authorityDeployment.address,
            sRip.address
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log("Yield director(giving) deployed: ", deployed.address);
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${authorityDeployment.address} ${sRip.address}`,
    );
};

func.tags = [CONTRACTS.give, "staking"];
func.dependencies = [CONTRACTS.treasury];

export default func;
