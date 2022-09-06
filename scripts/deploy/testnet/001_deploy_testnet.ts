import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, INITIAL_MINT, INITIAL_MINT_PROFIT } from "../../constants";
import { RipProtocolERC20Token__factory, RipProtocolTreasury__factory, DAI__factory } from "../../../types";
import { waitFor } from "../../txHelper";

const faucetContract = "RipFaucet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;

    if (network.name == "mainnet") {
        console.log("Faucet cannot be deployed to mainnet");
        return;
    }

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ripDeployment = await deployments.get(CONTRACTS.rip);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    // const presaleDeployment = await deployments.get(CONTRACTS.presale);

    const rip = RipProtocolERC20Token__factory.connect(ripDeployment.address, signer);
    const mockDai = DAI__factory.connect(daiDeployment.address, signer);
    const treasury = RipProtocolTreasury__factory.connect(treasuryDeployment.address, signer);
    // const presale = RIPPresale__factory.connect(presaleDeployment.address, signer);

    // Deploy Faucuet
    // await deploy(faucetContract, {
    //     from: deployer,
    //     args: [ripDeployment.address],
    //     log: true,
    //     skipIfAlreadyDeployed: true,
    // });
    // const faucetDeployment = await deployments.get(faucetContract);

    // let faucetBalance = await rip.balanceOf(faucetDeployment.address);
    // const minRip = ethers.BigNumber.from(10000 * 1e9);
    // if (faucetBalance.gt(minRip)) {
    //     // short circuit if faucet balance is above 10k rip
    //     console.log("Sufficient faucet balance");
    //     console.log("Faucet Balance: ", faucetBalance.toString());
    //     return;
    // }
    // Mint Dai
    const daiAmount = INITIAL_MINT;
    await waitFor(mockDai.mint(deployer, daiAmount+"0"));
    const daiBalance = await mockDai.balanceOf(deployer);
    console.log("Dai minted: ", daiBalance.toString());

    // Treasury Actions
    await waitFor(treasury.enable(0, deployer, ethers.constants.AddressZero)); // Enable the deployer to deposit reserve tokens
    await waitFor(treasury.enable(8, distributorDeployment.address, ethers.constants.AddressZero)); // Enable the deployer to deposit reserve tokens
    await waitFor(treasury.enable(2, daiDeployment.address, ethers.constants.AddressZero)); // Enable Dai as a reserve Token

    // Deposit and mint rip
    // await waitFor(mockDai.approve(treasury.address, INITIAL_MINT)); // Approve treasury to use the dai
    // await waitFor(treasury.deposit(INITIAL_MINT, daiDeployment.address, INITIAL_MINT_PROFIT)); // Deposit Dai into treasury, with a profit set, so that we have reserves for staking
    // const ripMinted = await rip.balanceOf(deployer);
    // console.log("Rip minted: ", ripMinted.toString());

    // Step 7: Initialize RIPPresale
    // await waitFor(presale.initialize(deployer, daiDeployment.address, aRIP.address, 1, new Date().getMilliseconds() + 86400000));
    // console.log("RIPPresale initialized");

    // Fund faucet w/ newly minted dai.
    // await waitFor(rip.approve(faucetDeployment.address, ripMinted));
    // await waitFor(rip.transfer(faucetDeployment.address, ripMinted));

    // faucetBalance = await rip.balanceOf(faucetDeployment.address);
    // console.log("Faucet balance:", faucetBalance.toString());
};

func.tags = ["faucet", "testnet"];
func.dependencies = [CONTRACTS.rip, CONTRACTS.DAI, CONTRACTS.treasury];
func.runAtTheEnd = true;

export default func;

// npx hardhat run scripts/deploy/testnet/001_deploy_testnet.ts