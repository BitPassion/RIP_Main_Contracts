const { ethers } = require("hardhat");

async function main() {
    // Initialize sRIP to index of 1 and rebase percentage of 1%
    const mockSRipFactory = await ethers.getContractFactory("MockSRIP");
    const mockSRip = await mockSRipFactory.deploy("1000000000", "10000000");

    console.log("sRIP DEPLOYED AT", mockSRip.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
