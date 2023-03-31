import { HardhatUserConfig } from "hardhat/config";
import '@openzeppelin/hardhat-upgrades';
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"
import "@openzeppelin/hardhat-defender"
import "hardhat-openzeppelin-defender";
import 'solidity-docgen';

require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? '81aacb448d56f225ff2fe1b0de1cb476bd6046be9484348431738f3fe46fa169';
const ARBITRUM_GOERLI_RPC = process.env.ARBITRUM_GOERLI_RPC ?? 'https://goerli.arbitrum.io/rpc';


const config: HardhatUserConfig = {
  docgen: {},
  defender: {
    apiKey: process.env.DEFENDER_TEAM_API_KEY!,
    apiSecret: process.env.DEFENDER_TEAM_API_SECRET_KEY!,
  },
  OpenzeppelinDefenderCredential: {
    apiKey: process.env.DEFENDER_TEAM_API_KEY!,
    apiSecret: process.env.DEFENDER_TEAM_API_SECRET_KEY!,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          viaIR: true
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        },
      },
      {
        version: "0.4.18"
      },
    ],
  },
  mocha: {
    timeout: 100000000
  },
  networks: {
    arbitrumGoerli: {
      url: ARBITRUM_GOERLI_RPC,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 421613,
    },
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 5,
      // gasPrice: 1000000000000 // 1000 wei
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337
    },
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
    gasPrice: 13,
    coinmarketcap: process.env.CMC_API_KEY
  },
  etherscan:{
    apiKey: {
      arbitrumGoerli: process.env.ARBITRUM_GOERLI_ETHERSCAN ?? ''
    }
  }
};

export default config;