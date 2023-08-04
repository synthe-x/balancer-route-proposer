import axios from "axios";
import { queryStr } from "./query";
import { IPool } from "../../utils/types";
require("dotenv").config();











let pools: IPool[] = [];
let tokensPrice: { [key: string]: string } = {};



export async function _fetchPoolData() {
  try {
    console.log(process.env.BALANCER_POOL_SUBGRAPH);
    let data = await axios({
      method: "post",
      url: process.env.BALANCER_POOL_SUBGRAPH,
      data:
      {
        query: queryStr
      }
    });

    pools = data.data.data.pools;
    console.log(pools);
    for (const pool of pools) {

      for (const token of pool.tokens) {
        tokensPrice[token.address] = "0"
      }
    }

  }
  catch (error) {
    console.log("Error @ fetchPoolData", error)
  }
}

export function fetchPoolData() {
  _fetchPoolData();
  setInterval(() => {
    _fetchPoolData()
  }, 1000 * 5)
}


export function getPools() {
  return pools
}

export function getTokenPrice(address: string) {
  return tokensPrice[address]
}

