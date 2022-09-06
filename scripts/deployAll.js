const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const DAI = "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C";
    const oldRIP = "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932";
    const oldsRIP = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";
    const oldStaking = "0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2";
    const oldwsRIP = "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad";
    const sushiRouter = "0x3380aE82e39E42Ca34EbEd69aF67fAa0683Bb5c1";
    const uniRouter = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";
    const oldTreasury = "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7";

    const FRAX = "0x2f7249cb599139e560f0c81c269ab9b04799e453";
    const LUSD = "0x45754df05aa6305114004358ecf8d04ff3b84e26";

    const Authority = await ethers.getContractFactory("RipProtocolAuthority");
    const authority = await Authority.deploy(
        deployer.address,
        deployer.address,
        deployer.address,
        deployer.address
    );

    const Migrator = await ethers.getContractFactory("RipProtocolTokenMigrator");
    const migrator = await Migrator.deploy(
        oldRIP,
        oldsRIP,
        oldTreasury,
        oldStaking,
        oldwsRIP,
        sushiRouter,
        uniRouter,
        "0",
        authority.address
    );

    const firstEpochNumber = "550";
    const firstBlockNumber = "9505000";

    const RIP = await ethers.getContractFactory("RipProtocolERC20Token");
    const rip = await RIP.deploy(authority.address);

    const SRIP = await ethers.getContractFactory("sRipProtocol");
    const sRIP = await SRIP.deploy();

    const GRIP = await ethers.getContractFactory("gRIP");
    const gRIP = await GRIP.deploy(migrator.address, sRIP.address);

    await migrator.setgRIP(gRIP.address);

    const RipProtocolTreasury = await ethers.getContractFactory("RipProtocolTreasury");
    const ripProtocolTreasury = await RipProtocolTreasury.deploy(rip.address, "0", authority.address);

    await ripProtocolTreasury.queueTimelock("0", migrator.address, migrator.address);
    await ripProtocolTreasury.queueTimelock("8", migrator.address, migrator.address);
    await ripProtocolTreasury.queueTimelock("2", DAI, DAI);
    await ripProtocolTreasury.queueTimelock("2", FRAX, FRAX);
    await ripProtocolTreasury.queueTimelock("2", LUSD, LUSD);

    await authority.pushVault(ripProtocolTreasury.address, true); // replaces rip.setVault(treasury.address)

    const RipProtocolStaking = await ethers.getContractFactory("RipProtocolStaking");
    const staking = await RipProtocolStaking.deploy(
        rip.address,
        sRIP.address,
        gRIP.address,
        "2200",
        firstEpochNumber,
        firstBlockNumber,
        authority.address
    );

    const Distributor = await ethers.getContractFactory("Distributor");
    const distributor = await Distributor.deploy(
        ripProtocolTreasury.address,
        rip.address,
        staking.address,
        authority.address
    );

    // Initialize srip
    await sRIP.setIndex("7675210820");
    await sRIP.setgRIP(gRIP.address);
    await sRIP.initialize(staking.address, ripProtocolTreasury.address);

    await staking.setDistributor(distributor.address);

    await ripProtocolTreasury.execute("0");
    await ripProtocolTreasury.execute("1");
    await ripProtocolTreasury.execute("2");
    await ripProtocolTreasury.execute("3");
    await ripProtocolTreasury.execute("4");

    console.log("RipProtocol Authority: ", authority.address);
    console.log("RIP: " + rip.address);
    console.log("sRip: " + sRIP.address);
    console.log("gRIP: " + gRIP.address);
    console.log("RipProtocol Treasury: " + ripProtocolTreasury.address);
    console.log("Staking Contract: " + staking.address);
    console.log("Distributor: " + distributor.address);
    console.log("Migrator: " + migrator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
