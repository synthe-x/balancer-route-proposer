import { SwapType } from '@balancer-labs/sdk';
import Big from 'big.js'
import { Graph } from '../graph/graph';
import axios from 'axios';
import { queryStr } from '../helper/query';
import { balancerPoolBySynthex } from '../helper/constant';
import { fetchOracleData } from '../helper/getOracleDetails';
import { promises as fs } from "fs";
import path from "path";
import { handleWeightedPool } from './handler/weightedPool';
import { handleStablePool } from './handler/stablePool';
import { handleSynthexPool } from './handler/synthexPool';
import { dummyPool, getPools, getTokenPrice } from './subGraphData/graphquery';
import { routeSeperator } from './handler/routeSeperator';
import { constantPrice } from './constant';
import { ERROR } from '../utils/error';
import { IDijkstraResponse, IError, IPool, IRouteProposer, ISwapData, IToken, ITokenMap } from '../utils/types';






export async function routeProposer(args: IRouteProposer):
    Promise<IError | { swapInput: ISwapData[][]; assets: string[][]; tokenMap: ITokenMap; }> {
    try {
        let { amount, t1, t2, kind, slipage, sender, recipient, deadline } = args;

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return { status: false, error: ERROR.AMOUNT_NOT_VALID, statusCode: 400 }
        }

        if (kind != SwapType.SwapExactIn && kind != SwapType.SwapExactOut) {
            return { status: false, error: ERROR.KIND_NOT_VALID, statusCode: 400 }
        }

        t1 = t1.toLowerCase();
        t2 = t2.toLowerCase();

        let usdPrice: number = kind == SwapType.SwapExactIn ? Number(constantPrice[t1]) : Number(constantPrice[t2]);
        let allPools: IPool[] = getPools();
        // console.log("pools", allPools);

        if (!usdPrice) {
            return { status: false, error: ERROR.TOKEN_NOT_FOUND, statusCode: 400 }
        }

        // console.log(usdPrice);

        if (!allPools) return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }

        const graph: Graph = new Graph();

        let tokenMap: ITokenMap = {};

        for (const currPool of allPools) {

            const currPooltokens: IToken[] = [];

            for (const token of currPool.tokens) {

                // if (token.token?.pool?.id) {
                //     console.log(token);
                //     continue;
                // }

                currPooltokens.push(token);
                tokenMap[token.address] = [token.symbol, constantPrice[token.address], token.decimals];
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

                    else if (currPool.poolType === "ComposableStable") {
                        handleStablePool(currPool, currPooltokens, kind, amount, usdPrice, tokenMap, tokenIn, tokenOut, graph);
                    }

                    // console.log('===================================')
                }
            }
        }

        // const poolIds = Object.keys(pools);

        // tokenMap = handleSynthexPool(poolIds, pools, amount, usdPrice, tokenMap, kind, graph);


        // for (let pool of balancerPoolBySynthex) {

        //     for (let tokenIn of pool.tokens) {

        //         for (let tokenOut of pool.tokens) {
        //             if (tokenIn.address === tokenOut.address) {
        //                 continue;
        //             }
        //             handleWeightedPool(pool, amount, usdPrice, kind, tokenMap, tokenIn, tokenOut, graph);
        //         }
        //     }
        // }

        const result: { [key: string]: IDijkstraResponse } | IError = graph.dijkstra(t1, t2);

        if (typeof result == 'object' && "status" in result) {
            return result as IError;
        }

        if (!result || !result[t2] || result[t2]["slipage"] == Infinity) {
            console.log("from dijisktra")
            return { status: false, error: ERROR.PAIR_NOT_AVAILABLE, statusCode: 400 }
        }

        const outPut: IDijkstraResponse[] = [];

        let sourceAsset = t2
        while (true) {
            let currAsset = sourceAsset
            outPut.push(result[currAsset])
            if (result[currAsset]["assets"]["assetIn"] != t1) {
                sourceAsset = result[currAsset]["assets"]["assetIn"]
            }
            else {
                break;
            }
        }

        outPut.reverse();

        // console.log(outPut);
        const data = routeSeperator(outPut, tokenMap, kind, slipage, sender, recipient, deadline);
        return data

    } catch (error) {
        console.log(`Error @ routeProposer ${error}`);
        return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }
    }

}
