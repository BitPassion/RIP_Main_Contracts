const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: " + deployer.address);

    const oldsRIP = "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084";

    const WSRIP = await ethers.getContractFactory("wRIP");
    const wsRIP = await WSRIP.deploy(oldsRIP);

    console.log("old wsRIP: " + wsRIP.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
