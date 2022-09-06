import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    EPOCH_LENGTH_IN_BLOCKS,
    FIRST_EPOCH_TIME,
    FIRST_EPOCH_NUMBER,
} from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ripDeployment = await deployments.get(CONTRACTS.rip);
    const sRipDeployment = await deployments.get(CONTRACTS.sRip);
    const gRipDeployment = await deployments.get(CONTRACTS.gRip);

    const deployed = await deploy(CONTRACTS.staking, {
        from: deployer,
        args: [
            ripDeployment.address,
            sRipDeployment.address,
            gRipDeployment.address,
            EPOCH_LENGTH_IN_BLOCKS,
            FIRST_EPOCH_NUMBER,
            FIRST_EPOCH_TIME,
            authorityDeployment.address,
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${ripDeployment.address} ${sRipDeployment.address} ${gRipDeployment.address} ${EPOCH_LENGTH_IN_BLOCKS} ${FIRST_EPOCH_NUMBER} ${FIRST_EPOCH_TIME} ${authorityDeployment.address}`,
    );
};

func.tags = [CONTRACTS.staking, "staking"];
func.dependencies = [CONTRACTS.rip, CONTRACTS.sRip, CONTRACTS.gRip];

export default func;
