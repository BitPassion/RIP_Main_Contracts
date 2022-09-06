import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const governo = "0x01C8d773C899D9ce0a9FE8d630d401D852180D9C";
    const policy = "0xC27bbA543E481f1cB792C545050c3936A23881D7";
    console.log(deployer);

    const deployed = await deploy(CONTRACTS.authority, {
        from: deployer,
        args: [governo, governo, policy, deployer],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${governo} ${governo} ${policy} ${deployer}`,
    );
};

func.tags = [CONTRACTS.authority, "migration", "staking"];

export default func;
