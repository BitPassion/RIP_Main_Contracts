# Rip Smart Contracts 

This is the main Rip smart contract development repository.

## 🔧 Setting up local development

### Requirements

-   [node v14](https://nodejs.org/download/release/latest-v14.x/)
-   [git](https://git-scm.com/downloads)

### Local Setup Steps

```sh
# Clone the repository
git clone https://github.com/R-ripDao/rip-contracts.git

# Install dependencies
yarn install

# Set up environment variables (keys)
cp .env.example .env # (linux)
copy .env.example .env # (windows)

# compile solidity, the below will automatically also run yarn typechain
yarn compile

# if you want to explicitly run typechain, run
yarn compile --no-typechain
yarn typechain

# run a local hardhat node
yarn run start

# test deployment or deploy 
# yarn run deploy:<network>, example:
yarn run deploy:hardhat
```

### Local Setup Steps (with Docker)

A Docker image is available to simplify setup.

```sh
# First setup keys, to do this first copy as above
cp .env.example .env # (linux)
copy .env.example .env # (windows)

# Populate ALCHEMY_API_KEY and PRIVATE_KEY into `.env` afterwards
# Then, start the node
make run
```

## 📜 Contract Addresses

 - For [BSC Mainnet](./docs/deployments/BSC.md).
 - For [BSC Testnet](./docs/deployments/BSCTEST.md).

### Notes for `localhost`
-   The `deployments/localhost` directory is included in the git repository,
    so that the contract addresses remain constant. Otherwise, the frontend's
    `constants.ts` file would need to be updated.
-   Avoid committing changes to the `deployments/localhost` files (unless you
    are sure), as this will alter the state of the hardhat node when deployed
    in tests.
