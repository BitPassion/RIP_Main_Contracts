export const CONTRACTS: Record<string, string> = {
    rip: "RipProtocolERC20Token",
    sRip: "sRipProtocol",
    gRip: "gRIP",
    staking: "RipProtocolStaking",
    distributor: "Distributor",
    treasury: "RipProtocolTreasury",
    bondDepo: "RipProtocolBondDepositoryV2",
    teller: "BondTeller",
    bondingCalculator: "RipProtocolBondingCalculator",
    authority: "RipProtocolAuthority",
    migrator: "RipProtocolTokenMigrator",
    FRAX: "Frax",
    DAI: "DAI",
    lusdAllocator: "LUSDAllocator",
    give: "YieldDirector",
    redeemHelper: "RedeemHelper",
    stakingHelper: "StakingHelper",
    bondHelper: "BondHelper",
    aRIP: "AlphaRIP",
    pRIP: "PreRIPProtocolToken",
    aRIPMigration: "aRIPMigration",
    presale: "RIPPresale",
};

// Constructor Arguments
export const TREASURY_TIMELOCK = 0;

// Constants
export const LARGE_APPROVAL = "100000000000000000000000000000000";
export const EPOCH_LENGTH_IN_BLOCKS = "28800";
export const FIRST_EPOCH_NUMBER = "0";
export const FIRST_EPOCH_TIME = Math.ceil(new Date().getTime()/1000) + 86400 * 16.125 + 600 + "";
export const INITIAL_REWARD_RATE = "2975";
export const INITIAL_INDEX = "1000000000";
export const INITIAL_MINT = "60000" + "0".repeat(18); // 60K deposit.
export const BOUNTY_AMOUNT = "100";
export const INITIAL_MINT_PROFIT = "30000000000000";
