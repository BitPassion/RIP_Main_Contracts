import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // For Liquity addresses:
    // mainnet: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/realDeploymentOutput/output14.txt
    // rinkeby: https://github.com/liquity/dev/blob/main/packages/contracts/mainnetDeployment/rinkebyDeploymentOutput.json

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const stabilityPool = "0xFd0dB2BA8BEaC72d45f12A76f40c345BBf5f6F8d";
    const stakingPool = "0x35D3293EA6dD210b8Ca25668ae266ca4C834Ea1b";
    const weth = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
    const hopTokenAddress = "0x0c085b4b68261dA18D860F647A33216503b3b26C"; // DAI

    // const deployed = await deploy(CONTRACTS.lusdAllocator, {
    //     from: deployer,
    //     args: [
    //         authorityDeployment.address,
    //         treasuryDeployment.address,
    //         lusdTokenAddress,
    //         lqtyToken,
    //         stabilityPool,
    //         stakingPool,
    //         "0x0000000000000000000000000000000000000000",
    //         weth,
    //         hopTokenAddress,
    //         "0x0000000000000000000000000000000000000000",
    //     ],
    //     log: true,
    //     skipIfAlreadyDeployed: true,
        // });
    // console.log(
    //     `To verify: npx hardhat verify ${deployed.address} ${authorityDeployment.address} ${treasuryDeployment.address} ${lusdTokenAddress} ${lqtyToken} ${stabilityPool} ${stakingPool} 0x0000000000000000000000000000000000000000 ${weth} ${hopTokenAddress} 0x0000000000000000000000000000000000000000`,
    // );
    console.log("skip allocator...");
};

func.tags = [CONTRACTS.distributor, "lusdallocator"];
func.dependencies = [CONTRACTS.treasury];

export default func;
