import { SwapType } from '@balancer-labs/sdk';
import { Graph } from '../graph/graph';
import { handleWeightedPool } from './handler/weightedPool';
import { handleStablePool } from './handler/stablePool';
import { getPools } from './subGraphData/graphquery';
import { routeSeperator } from './handler/routeSeperator';
import { MANTLE_TOKEN_ADDRESS, ZERO_ADDRESS, constantPrice } from './constant';
import { ERROR } from '../utils/error';
import { IDijkstraResponse, IError, IPool, IRouteProposer, ISwapData, IToken, ITokenMap } from '../utils/types';
import { getPrices } from '../tokenPrice';
import { promises as fs } from "fs";
import path from "path";
import { handleSynthexPool } from './handler/synthexPool';







export async function routeProposer(args: IRouteProposer):
    Promise<IError | { swapInput: ISwapData[][]; assets: string[][]; tokenMap: ITokenMap; isEth: boolean }> {
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
        let isEth: boolean = false;

        if(t1 === ZERO_ADDRESS){
            isEth = true;
            t1 = MANTLE_TOKEN_ADDRESS;
        }
        let usdPrice: number = kind == SwapType.SwapExactIn ? getPrices(t1) ?? Number(constantPrice[t1]) : getPrices(t2) ?? Number(constantPrice[t2]);
        let allPools: IPool[] = getPools();
        const pools = JSON.parse((await fs.readFile(path.join(__dirname + "/../helper/synthexPoolConfig.json"))).toString());

        if (!usdPrice) {
            const tokenAddress = kind === SwapType.SwapExactIn ? t1 : t2
            let flag = false;
            for (const poolId of Object.keys(pools)) {

                if (pools[poolId]["synths"][tokenAddress]) {
                    const tokenPrice = getPrices(tokenAddress);
                    if (tokenPrice) {
                        usdPrice = tokenPrice
                        flag = true;
                        break;
                    }
                }
            }
            if (!flag)
                return { status: false, error: ERROR.TOKEN_NOT_FOUND, statusCode: 400 }
        }

        if (!allPools) return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }

        const graph: Graph = new Graph();

        let tokenMap: ITokenMap = {};

        for (const currPool of allPools) {

            const currPooltokens: IToken[] = [];

            for (const token of currPool.tokens) {

                if (token.address === currPool.address) {
                    continue;
                }
                const tokenPrice = getPrices(token.address) ?? (isNaN(Number(constantPrice[token.address])) ? null : Number(constantPrice[token.address])) ?? token.token.latestUSDPrice;
                if (!tokenPrice) {
                    continue;
                }
                currPooltokens.push(token);
                tokenMap[token.address] = [token.symbol, tokenPrice.toString(), token.decimals];
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
                }
            }
        }

        const poolIds = Object.keys(pools);

        tokenMap = handleSynthexPool(poolIds, pools, amount, usdPrice, tokenMap, kind, graph);

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
        // console.log("outPut", outPut);
        let data = routeSeperator(outPut, tokenMap, kind, slipage, sender, recipient, deadline);
        if(typeof data == 'object' && "swapInput" in data){
          data.isEth = isEth;
          return  data;
        }
        return data

    } catch (error) {
        console.log(`Error @ routeProposer ${error}`);
        return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 }
    }

}
