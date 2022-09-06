import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const ripDeployment = await deployments.get(CONTRACTS.rip);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // TODO: firstEpochBlock is passed in but contract constructor param is called _nextEpochBlock
    const deployed = await deploy(CONTRACTS.distributor, {
        from: deployer,
        args: [
            treasuryDeployment.address,
            ripDeployment.address,
            stakingDeployment.address,
            authorityDeployment.address,
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${treasuryDeployment.address} ${ripDeployment.address} ${stakingDeployment.address} ${authorityDeployment.address}`,
    );
};

func.tags = [CONTRACTS.distributor, "distributor"];
func.dependencies = [
    CONTRACTS.treasury,
    CONTRACTS.rip,
    CONTRACTS.bondingCalculator,
    CONTRACTS.ripProtocolAuthority,
];

export default func;
