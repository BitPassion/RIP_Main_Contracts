import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

// Mainnet Addresses addresses
// const oldRIP = "0xACC1230B92F67e9F586e0d6633A17819CA5d9Eb3";
// const oldsRIP = "0x1a0130B763e1afa32B51C83a680F61D0fF2f7d37";
// const oldTreasury = "0x957B10c011B4F4C44b0EaF518ef31a2583db3f44";
// const oldStaking = "0x485847bF7a457E9B371A162ad2c310b4446ef5C8";
// const oldwsRIP = "0x1a0130B763e1afa32B51C83a680F61D0fF2f7d37";
const apeRouter = "0x3380aE82e39E42Ca34EbEd69aF67fAa0683Bb5c1";
const pancakeRouter = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // const deployed = await deploy(CONTRACTS.migrator, {
    //     from: deployer,
    //     args: [
    //         // oldRIP,
    //         // oldsRIP,
    //         // oldTreasury,
    //         // oldStaking,
    //         // oldwsRIP,
    //         apeRouter,
    //         pancakeRouter,
    //         "0",
    //         authorityDeployment.address,
    //     ],
    //     log: true,
    //     skipIfAlreadyDeployed: true,
    // });
    // console.log(
    //     `To verify: npx hardhat verify ${deployed.address} ${oldRIP} ${oldsRIP} ${oldTreasury} ${oldStaking} ${oldwsRIP} ${apeRouter} ${pancakeRouter} 0 ${authorityDeployment.address}`,
    // );
};

func.tags = [CONTRACTS.migrator, "migration"];

export default func;
