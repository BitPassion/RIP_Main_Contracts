const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const firstEpochNumber = "";
    const firstBlockNumber = "";
    const gRIP = "";
    const authority = "";

    const RIP = await ethers.getContractFactory("RipProtocolERC20Token");
    const rip = await RIP.deploy(authority);

    const RipProtocolTreasury = await ethers.getContractFactory("RipProtocolTreasury");
    const ripProtocolTreasury = await RipProtocolTreasury.deploy(rip.address, "0", authority);

    const SRIP = await ethers.getContractFactory("sRipProtocol");
    const sRIP = await SRIP.deploy();

    const RipProtocolStaking = await ethers.getContractFactory("RipProtocolStaking");
    const staking = await RipProtocolStaking.deploy(
        rip.address,
        sRIP.address,
        gRIP,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
        authority
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        ripProtocolTreasury.address,
        rip.address,
        staking.address,
        authority
    );

    await sRIP.setIndex("");
    await sRIP.setgRIP(gRIP);
    await sRIP.initialize(staking.address, ripProtocolTreasury.address);

    console.log("RIP: " + rip.address);
    console.log("RipProtocol Treasury: " + ripProtocolTreasury.address);
    console.log("Staked RipProtocol: " + sRIP.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
