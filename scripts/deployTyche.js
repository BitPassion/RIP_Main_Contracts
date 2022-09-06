const { ethers } = require("hardhat");

async function main() {
    // Mainnet sRIP contract
    const sRipMainnet = "0x04906695D6D12CF5459975d7C3C03356E4Ccd460";
    const authorityMainnet = "0x16bE3986B00Cb0dB40ce34760F4b7Dd1Dc24FcCA";

    // Testnet
    //const mockSripDeployment = "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727";
    const mockSripDeployment = "0x424426FB5E93A4E039CD79E0Cba4Fa220cE945C3";
    const authorityDeployment = "0x52a3a2A45D837247B4Eca824583bAdaFfD4151dd";

    const yieldDirectorFactory = await ethers.getContractFactory("YieldDirector");
    //const yieldDirector = await yieldDirectorFactory.deploy(mockSRip.address);

    const yieldDirector = await yieldDirectorFactory.deploy(sRipMainnet, authorityMainnet);

    //console.log("SRIP DEPLOYED AT", mockSRip.address);
    console.log("YIELD DIRECTOR DEPLOYED AT", yieldDirector.address);
}

main()
    .then(() => process.exit())
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
