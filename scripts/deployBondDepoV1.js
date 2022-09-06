const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const rip = "0x94eE88A2A25117364445e4aC850AF1aAd24B8a7c";
    const principle = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const treasury = "0xFCB12EEeb8310928eA47DE5835cd7417fb88aC69";
    const dao = deployer.address;
    const calculator = "0x2D8053F2451328617e3a44C4e93F5E6541E98De1";

    const depoFactory = await ethers.getContractFactory("RIPProtocolBondDepository");

    const depo = await depoFactory.deploy(rip, principle, treasury, dao, calculator);

    console.log("Bond DepoV1: " + depo.address);
    console.log(`To verify: npx hardhat verify ${depo.address} ${rip} ${principle} ${treasury} ${dao} ${calculator}`);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run ./scripts/deployBondDepoV1.js