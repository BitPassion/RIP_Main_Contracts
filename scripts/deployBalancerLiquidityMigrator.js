const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const Authority = "0x16bE3986B00Cb0dB40ce34760F4b7Dd1Dc24FcCA";

    const BalancerLiquidityMigrator = await ethers.getContractFactory("BalancerLiquidityMigrator");
    const balancerLiquidityMigrator = await BalancerLiquidityMigrator.deploy(Authority);

    console.log("Balancer Liquidity Migrator: " + balancerLiquidityMigrator.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
