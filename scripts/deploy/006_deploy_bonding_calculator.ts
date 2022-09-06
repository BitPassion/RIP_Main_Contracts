import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { RipProtocolERC20Token__factory } from "../../types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ripDeployment = await deployments.get(CONTRACTS.rip);
    const rip = await RipProtocolERC20Token__factory.connect(ripDeployment.address, signer);

    const deployed = await deploy(CONTRACTS.bondingCalculator, {
        from: deployer,
        args: [rip.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${rip.address}`,
    );
};

func.tags = [CONTRACTS.bondingCalculator, "staking", "bonding"];
func.dependencies = [CONTRACTS.rip];

export default func;
