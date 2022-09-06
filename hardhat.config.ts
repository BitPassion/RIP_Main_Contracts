import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { NetworkUserConfig } from "hardhat/types";

import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "./scripts/constants";
import { HardhatUserConfig, task } from "hardhat/config";
import { ARIPMigration__factory } from "./types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
    goerli: 5,
    hardhat: 1337,
    kovan: 42,
    mainnet: 1,
    rinkeby: 4,
    ropsten: 3,
    bsc: 56,
    bsctest: 97
};

// Ensure that we have all the environment variables we need.
const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";
// Make sure node is setup on Alchemy website
const alchemyApiKey = process.env.ALCHEMY_API_KEY ?? "NO_ALCHEMY_API_KEY";

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
    return {
        accounts: [`${privateKey}`],
        chainId: chainIds[network],
        url: `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`,
        gasPrice: undefined,
    };
}

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS ? true : true,
        excludeContracts: [],
        src: "./contracts",
    },
    networks: {
        hardhat: {
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
            },
            chainId: chainIds.hardhat,
        },
        local: {
            url: "http://127.0.0.1:7545",
        },
        // Uncomment for testing. Commented due to CI issues
        mainnet: getChainConfig("mainnet"),
        rinkeby: getChainConfig("rinkeby"),
        bsctest: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: chainIds["bsctest"],
            accounts: [`${privateKey}`]
        },
        bsc: {
            url: "https://speedy-nodes-nyc.moralis.io/9f1fe98d210bc4fca911bee2/bsc/mainnet/archive",
            chainId: chainIds["bsc"],
            accounts: [`${privateKey}`]
        },
    },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
        deploy: "./scripts/deploy",
        deployments: "./deployments",
    },
    solidity: {
        compilers: [
            {
                version: "0.8.10",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
            {
                version: "0.7.5",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
            {
                version: "0.5.16",
            },
        ],
        settings: {
            outputSelection: {
                "*": {
                    "*": ["storageLayout"],
                },
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        daoMultisig: {
            // mainnet
            1: "0x70b0AAFeb562fE47CD2342faF066ffdF4394228B",
        },
    },
    typechain: {
        outDir: "types",
        target: "ethers-v5",
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY,
    },
    mocha: {
        timeout: 1000000,
    },
};

export default config;

// before deploy, set correctly FIRST_EPOCH_TIME, FIRST_EPOCH_NUMBER, EPOCH_LENGTH_IN_BLOCKS in constants
// check reciepient in staking SC
// check presale deploy script & all scripts comment
// check presale address in aripmigration deploy script
// check treasury address in cream allocator SC
// check comment lines in 100 deploy