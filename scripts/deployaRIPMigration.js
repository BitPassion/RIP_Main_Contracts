const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const aRIPMigrationFactory = await ethers.getContractFactory("aRIPMigration");

    const deployed = await aRIPMigrationFactory.deploy();

    console.log("aRIPMigration: " + deployed.address);
    console.log(`To verify: npx hardhat verify ${deployed.address}`);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run ./scripts/deployaRIPMigration.js