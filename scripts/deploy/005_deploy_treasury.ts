import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, TREASURY_TIMELOCK } from "../constants";
//import { DAI, FRAX, RipProtocolERC20Token, RipProtocolTreasury } from "../types";
import { RipProtocolAuthority__factory } from "../../types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ripDeployment = await deployments.get(CONTRACTS.rip);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // TODO: TIMELOCK SET TO 0 FOR NOW, CHANGE FOR ACTUAL DEPLOYMENT
    const deployed = await deploy(CONTRACTS.treasury, {
        from: deployer,
        args: [ripDeployment.address, TREASURY_TIMELOCK, authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
    console.log(
        `To verify: npx hardhat verify ${deployed.address} ${ripDeployment.address} ${TREASURY_TIMELOCK} ${authorityDeployment.address}`,
    );

    // const authContract =  RipProtocolAuthority__factory.connect(authorityDeployment.address, signer);
    // await authContract.pushVault(deployed.address, true);
    // console.log("Updated vault address with treasury address.");
};

func.tags = [CONTRACTS.treasury, "treasury"];
func.dependencies = [CONTRACTS.rip];

export default func;
