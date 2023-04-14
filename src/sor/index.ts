import { SwapType } from '@balancer-labs/sdk';
import Big from 'big.js'
import { Graph, PoolType } from '../graph/graph';
import axios from 'axios';
import { queryStr } from '../helper/query';
import { balancerPoolBySynthex, TokenMap } from '../helper/constant';
import { fetchOracleData } from '../helper/getOracleDetails';
import { promises as fs } from "fs";
import path from "path";
import { routeProposerHelper } from './handler/routeProposerHelper';
import { handleWeightedPool } from './handler/weightedPool';
import { handleStablePool } from './handler/stablePool';
import { handleSynthexPool } from './handler/synthexPool';
import { getPools, getTokenPrice } from './graphData/graphquery';
import { routeSeperator } from './handler/routeSeperator';




// 0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709
// routeProposer("1", "0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 1);

export async function routeProposer(amount: any, t1: string, t2: string, kind: SwapType): Promise<any> {
    try {

        if (isNaN(Number(amount)) || Number(amount) < 0) {
            return console.log("AMOUNT_NOT_VALID")
        }

        if (kind != SwapType.SwapExactIn && kind != SwapType.SwapExactOut) {
            return console.log("KIND_NOT_VALID")
        }

        t1 = t1.toLowerCase();
        t2 = t2.toLowerCase();

        let usdPrice: number = getTokenPrice(kind == SwapType.SwapExactIn ? t1 : t2);
        let allPools: any = getPools()

        const pools = JSON.parse((await fs.readFile(path.join(__dirname + "/../helper/synthexPoolConfig.json"))).toString());



        if (!usdPrice) {
            //checking if token is from synthex pool
            const token = kind === SwapType.SwapExactIn ? t1 : t2
            let flag = false;
            for (const poolId of Object.keys(pools)) {

                if (pools[poolId]["synths"][token]) {
                    usdPrice = pools[poolId]["synths"][token]["priceUSD"];
                    flag = true;
                    break;
                }
            }
            if (!flag) return console.log("PAIR_NOT_AVAILABLE");
        }
        console.log(usdPrice);

        if (!allPools) return console.log("PLEASE_TRY_AGAIN");

        const graph = new Graph();

        let tokenMap: TokenMap = {};

        for (const currPool of allPools) {

            const currPooltokens: any[] = [];

            for (const token of currPool.tokens) {

                if (!token.token?.latestUSDPrice) {
                    break;
                }

                currPooltokens.push(token);
                tokenMap[token.address] = [token.symbol, token.token?.latestUSDPrice, token.decimals];
            }

            for (const tokenIn of currPooltokens) {

                if (currPooltokens.length < 2 || !tokenMap[tokenIn.address]) {
                    continue;
                }

                for (const tokenOut of currPooltokens) {

                    if (tokenIn.address === tokenOut.address) {
                        continue;
                    }

                    if (currPool.poolType === "Weighted") {
                        handleWeightedPool(currPool, amount, usdPrice, kind, tokenMap, tokenIn, tokenOut, graph);
                    }

                    else if (currPool.poolType === "Stable") {
                        handleStablePool(currPool, currPooltokens, kind, amount, usdPrice, tokenMap, tokenIn, tokenOut, graph);
                    }

                    // console.log('===================================')
                }
            }
        }

        const poolIds = Object.keys(pools);

        tokenMap = handleSynthexPool(poolIds, pools, amount, usdPrice, tokenMap, kind, graph);


        for (let pool of balancerPoolBySynthex) {

            for (let tokenIn of pool.tokens) {

                for (let tokenOut of pool.tokens) {
                    if (tokenIn.address === tokenOut.address) {
                        continue;
                    }
                    handleWeightedPool(pool, amount, usdPrice, kind, tokenMap, tokenIn, tokenOut, graph);
                }
            }
        }

        const res = graph.dijkstra(t1, t2);

        if (!res || !res[t2] || res[t2]["slipage"] == Infinity) return console.log("PAIR_NOT_FOUND");

        const outPut: any = [];

        let sourceAsset = t2
        while (true) {
            let currAsset = sourceAsset
            outPut.push(res[currAsset])
            if (res[currAsset]["assets"]["assetIn"] != t1) {
                sourceAsset = res[currAsset]["assets"]["assetIn"]
            }
            else {
                break;
            }
        }

        outPut.reverse();

        console.log(outPut);
        return routeSeperator(outPut, tokenMap, kind)
    } catch (error) {
        console.log(error)
    }

}
