import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../txHelper";
import { CONTRACTS, INITIAL_REWARD_RATE, INITIAL_INDEX, BOUNTY_AMOUNT } from "../constants";
import {
    RipProtocolAuthority__factory,
    Distributor__factory,
    RipProtocolERC20Token__factory,
    RipProtocolStaking__factory,
    SRipProtocol__factory,
    GRIP__factory,
    RipProtocolTreasury__factory,
    ARIPMigration__factory
    // LUSDAllocator__factory,
} from "../../types";

// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // return;
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ripDeployment = await deployments.get(CONTRACTS.rip);
    const sRipDeployment = await deployments.get(CONTRACTS.sRip);
    const gRipDeployment = await deployments.get(CONTRACTS.gRip);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const bondDepo = await deployments.get(CONTRACTS.bondDepo);
    // const aOHMMigration = await deployments.get(CONTRACTS.aOHMMigration);
    // const lusdAllocatorDeployment = await deployments.get(CONTRACTS.lusdAllocator);

    const authorityContract = await RipProtocolAuthority__factory.connect(
        authorityDeployment.address,
        signer
    );
    const rip = RipProtocolERC20Token__factory.connect(ripDeployment.address, signer);
    const sRip = SRipProtocol__factory.connect(sRipDeployment.address, signer);
    const gRip = GRIP__factory.connect(gRipDeployment.address, signer);
    const distributor = Distributor__factory.connect(distributorDeployment.address, signer);
    const staking = RipProtocolStaking__factory.connect(stakingDeployment.address, signer);
    const treasury = RipProtocolTreasury__factory.connect(treasuryDeployment.address, signer);
    // const aOHMMigrator = ARIPMigration__factory.connect(aOHMMigration.address, signer);
    // const lusdAllocator = LUSDAllocator__factory.connect(lusdAllocatorDeployment.address, signer);

    // Step 1: Set treasury as vault on authority
    await waitFor(authorityContract.pushVault(treasury.address, true));
    console.log("Setup -- authorityContract.pushVault: set vault on authority");

    // Step 2: Set distributor as minter on treasury
    await waitFor(treasury.enable(8, distributor.address, ethers.constants.AddressZero)); // Allows distributor to mint rip.
    console.log("Setup -- treasury.enable(8):  distributor enabled to mint rip on treasury");

    // Step 3: Set distributor on staking
    await waitFor(staking.setDistributor(distributor.address));
    console.log("Setup -- staking.setDistributor:  distributor set on staking");

    // Step 4: Initialize sRIP and set the index
    if ((await sRip.gRIP()) == ethers.constants.AddressZero) {
        await waitFor(sRip.setIndex(INITIAL_INDEX)); // TODO
        await waitFor(sRip.setgRIP(gRip.address));
        await waitFor(sRip.initialize(staking.address, treasuryDeployment.address));
    }
    console.log("Setup -- srip initialized (index, grip)");

    // Step 5: Set up distributor with bounty and recipient
    await waitFor(distributor.setBounty(BOUNTY_AMOUNT));
    if(await (await distributor.info(0)).length < 1) {
        await waitFor(distributor.addRecipient(staking.address, INITIAL_REWARD_RATE));
        console.log("Setup -- distributor.setBounty && distributor.addRecipient");
    }

    // Step 6: Migrate approved to staking in gRIP
    if(!(await gRip.migrated())) {
        await waitFor(gRip.migrate(staking.address, sRip.address));
        console.log("Migrated approved to staking in gRip");
    }

    // await waitFor(aOHMMigrator.initialize(ripDeployment.address, sRipDeployment.address, 14324131 + 246 * 240))
    // Approve staking contact to spend deployer's RIP
    // TODO: Is this needed?
    // await rip.approve(staking.address, LARGE_APPROVAL);
};

func.tags = ["setup"];
func.dependencies = [CONTRACTS.rip, CONTRACTS.sRip, CONTRACTS.gRip];

export default func;
