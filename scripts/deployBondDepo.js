const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const authority = "0x16bE3986B00Cb0dB40ce34760F4b7Dd1Dc24FcCA";
    const rip = "0x94eE88A2A25117364445e4aC850AF1aAd24B8a7c";
    const grip = "0x587a678b124B828d9b3f97fcE3f62C7564154C7A";
    const staking = "0x3c4dd4fc4bf141F31D0e52c52E097BdAb3b93DFd";
    const treasury = "0xFCB12EEeb8310928eA47DE5835cd7417fb88aC69";

    const depoFactory = await ethers.getContractFactory("RipProtocolBondDepositoryV2");

    const depo = await depoFactory.deploy(authority, rip, grip, staking, treasury);

    console.log("Bond DepoV2: " + depo.address);
    console.log(`To verify: npx hardhat verify ${depo.address} ${authority} ${rip} ${grip} ${staking} ${treasury}`);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run ./scripts/deployBondDepo.js