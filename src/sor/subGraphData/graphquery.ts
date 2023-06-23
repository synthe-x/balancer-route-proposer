import axios from "axios";
import { queryStr } from "../../helper/query";
import { IPool } from "../../utils/types";











let pools: IPool[] = [];
let tokensPrice: { [key: string]: string } = {};



export async function _fetchPoolData() {
  try {
    // let arbitrum = "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2"
    let raex = "https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/reax-swaps"

    let data = await axios({
      method: "post",
      url: raex,
      data:
      {
        query: queryStr
      }
    });

    pools = data.data.data.pools;

    for (const pool of pools) {

      for (const token of pool.tokens) {
        tokensPrice[token.address] = token.token.latestUSDPrice ?? "0"
      }
    }
    // console.log(tokensPrice)
  }
  catch (error) {
    console.log("Error @ fetchPoolData", error)
  }
}

export function fetchPoolData() {
  _fetchPoolData();
  setInterval(() => {
    _fetchPoolData()
  }, 1000 * 10)
}


export function getPools() {
  return pools
}

export function getTokenPrice(address: string) {
  return tokensPrice[address]
}

export const dummyPool = [
  {
    "id": "0xab0f224825ef246923bba7b881822533b0faabe1000200000000000000000004",
    "poolType": "Weighted",
    "swapFee": "0.000001",
    "amp": null,
    "tokens": [
      {
        "weight": "0.5",
        "balance": "555.55",
        "address": "0x55f317247632d42584848064a0cc0190fe1f6c58",
        "symbol": "WETH",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": "0.5",
        "balance": "1000000",
        "address": "0xc7bde95c4b5c62ce52b7edf8a2ab59437186028d",
        "symbol": "USDC",
        "decimals": 6,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  },
  {
    "id": "0x8b6f79c502402155056238d7cffdab714c5a5dd7000200000000000000000003",
    "poolType": "Weighted",
    "swapFee": "0.000001",
    "amp": null,
    "tokens": [
      {
        "weight": "0.8",
        "balance": "1000000",
        "address": "0x4ba519a744dc106a75308071f5b30d1f10425981",
        "symbol": "REAX",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": "0.2",
        "balance": "11.11",
        "address": "0x55f317247632d42584848064a0cc0190fe1f6c58",
        "symbol": "WETH",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  },
  {
    "id": "0x4250599e7b25619b3742bd70d4896fa328c7639e000000000000000000000002",
    "poolType": "ComposableStable",
    "swapFee": "0.000001",
    "amp": "100",
    "tokens": [
      {
        "weight": null,
        "balance": "10000000",
        "address": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
        "symbol": "cUSD",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "10000000",
        "address": "0x4250599e7b25619b3742bd70d4896fa328c7639e",
        "symbol": "REAX-USD-POOL",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "10000000",
        "address": "0xc7bde95c4b5c62ce52b7edf8a2ab59437186028d",
        "symbol": "USDC",
        "decimals": 6,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "10000000",
        "address": "0xe3c0de2996c03fb2d6090e652bd4311641117efd",
        "symbol": "sUSD",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  }
]
export const _dummyPool = [
  {
    "id": "0xab0f224825ef246923bba7b881822533b0faabe1000200000000000000000004",
    "poolType": "Weighted",
    "swapFee": "0.000001",
    "amp": null,
    "tokens": [
      {
        "weight": "0.5",
        "balance": "3.890985743436531887",
        "address": "0x55f317247632d42584848064a0cc0190fe1f6c58",
        "symbol": "WETH",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": "0.5",
        "balance": "123.385119",
        "address": "0xc7bde95c4b5c62ce52b7edf8a2ab59437186028d",
        "symbol": "USDC",
        "decimals": 6,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  },
  {
    "id": "0x8b6f79c502402155056238d7cffdab714c5a5dd7000200000000000000000003",
    "poolType": "Weighted",
    "swapFee": "0.000001",
    "amp": null,
    "tokens": [
      {
        "weight": "0.8",
        "balance": "0",
        "address": "0x4ba519a744dc106a75308071f5b30d1f10425981",
        "symbol": "REAX",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": "0.2",
        "balance": "0",
        "address": "0x55f317247632d42584848064a0cc0190fe1f6c58",
        "symbol": "WETH",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  },
  {
    "id": "0x4250599e7b25619b3742bd70d4896fa328c7639e000000000000000000000002",
    "poolType": "ComposableStable",
    "swapFee": "0.000001",
    "amp": "100",
    "tokens": [
      {
        "weight": null,
        "balance": "0",
        "address": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
        "symbol": "cUSD",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "0",
        "address": "0x4250599e7b25619b3742bd70d4896fa328c7639e",
        "symbol": "REAX-USD-POOL",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "0",
        "address": "0xc7bde95c4b5c62ce52b7edf8a2ab59437186028d",
        "symbol": "USDC",
        "decimals": 6,
        "token": {
          "latestUSDPrice": null
        }
      },
      {
        "weight": null,
        "balance": "0",
        "address": "0xe3c0de2996c03fb2d6090e652bd4311641117efd",
        "symbol": "sUSD",
        "decimals": 18,
        "token": {
          "latestUSDPrice": null
        }
      }
    ]
  }
]