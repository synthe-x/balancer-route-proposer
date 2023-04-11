import { BalancerSDK, BalancerSdkConfig, Network, parseFixed, PoolFilter, PoolWithMethods, SOR, SwapType, TokenPriceProvider } from '@balancer-labs/sdk';
import Big from 'big.js'
import { Graph, PoolType } from '../graph/graph';
import axios from 'axios';
import { queryStr } from '../helper/query';
import { balancerPoolBySynthex, synthexPools, TokenMap } from '../helper/constant';
import { fetchOracleData } from '../helper/getOracleDetails';
import { promises as fs } from "fs";
import path from "path";
import { weightedPoolTokenInForTokenOut } from '../math/wieghtedPool';
import {  bnum } from '../utils/bigNumber';

import {  fp } from '../math/numbers';

import {  calcOutGivenIn } from '../math/stablePool1';
import { routeProposerHelper } from './handler/routeProposerHelper';

// const config: BalancerSdkConfig = {
//     network: Network.ARBITRUM,
//     rpcUrl: "https://arb1.arbitrum.io/rpc"                             //"https://endpoints.omniatech.io/v1/arbitrum/one/public",
// };
// const balancer = new BalancerSDK(config);



// routeProposer("100", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", "0xdd206e7f12f2c15f935b8548d4c6c9e1235bb9c0", 0);

export async function routeProposer(amount: any, t1: string, t2: string, kind: SwapType): Promise<any> {
    try {

        if (isNaN(Number(amount)) || Number(amount) < 0) {
            return console.log("AMOUNT_NOT_VALID")
        }

        if (kind != SwapType.SwapExactIn && kind != SwapType.SwapExactOut) {
            return console.log("KIND_NOT_VALID")
        }

        let usdPrice: number;
        let allPools: any;

        try {

            let arbitrum = "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2"
            const promise: any = await Promise.allSettled(
                [
                    axios.get(`https://api.coingecko.com/api/v3/coins/arbitrum-one/contract/${kind == SwapType.SwapExactIn ? t1 : t2}`),
                    axios({
                        method: "post",
                        url: arbitrum,
                        data:
                        {
                            query: queryStr
                        }
                    }),
                    fetchOracleData()
                ]);

            usdPrice = promise[0]?.value?.data.market_data?.current_price?.usd;
            allPools = promise[1]?.value?.data.data.pools
            
        }
        catch (error: any) {
            return console.log(error);
        }

        const pools = JSON.parse((await fs.readFile(path.join(__dirname + "/../helper/synthexPoolConfig.json"))).toString());

        t1 = t1.toLowerCase();
        t2 = t2.toLowerCase();

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

            const poolId = currPool.id;
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

                    let swapAmount = Big(amount).times(usdPrice)
                        .times(10 ** tokenMap[tokenIn.address][2])
                        .div(tokenMap[tokenIn.address][1])
                        .toFixed(0);

                    if (kind === SwapType.SwapExactOut) {
                        swapAmount = Big(amount).times(usdPrice)
                            .times(10 ** tokenMap[tokenOut.address][2])
                            .div(tokenMap[tokenOut.address][1])
                            .toFixed(0);
                    }

                    if (currPool.poolType === "Weighted") {

                        let tokenOutAMount = weightedPoolTokenInForTokenOut((swapAmount),
                            {
                                balanceIn: bnum(tokenIn.balance),
                                balanceOut: bnum(tokenOut.balance),
                                decimalsIn: bnum(tokenIn.decimals),
                                decimalsOut: bnum(tokenOut.decimals),
                                weightIn: bnum(tokenIn.weight),
                                weightOut: bnum(tokenOut.weight),
                                swapFee: bnum(currPool.swapFee)
                            });

                        let actualAmount = Big(tokenOutAMount).times(tokenMap[tokenOut.address][1]).toFixed(18);

                        let expectedAmount = Big(swapAmount)
                            .div((10 ** tokenMap[tokenIn.address][2]))
                            .times(tokenMap[tokenIn.address][1]).toFixed(18);

                        let slipage = Big(expectedAmount).minus(actualAmount).toNumber();
                        // console.log(tokenIn.address)
                        // console.log(tokenOut.address)
                        // console.log(poolId)
                        // console.log("Slipage", slipage)
                        slipage = slipage > 0 ? slipage : 0;

                        const amountInTokenDecimal = swapAmount.toString();

                        const amountOutTokenDecimal = Big(tokenOutAMount).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);

                        if (!slipage) slipage = 0;

                        graph.addVertex(tokenIn.address);

                        graph.addEdge(tokenIn.address, tokenOut.address, slipage, poolId, amountInTokenDecimal, amountOutTokenDecimal, tokenMap[tokenIn.address][2], tokenMap[tokenOut.address][2], PoolType.balancer);


                    }
                    if (currPool.poolType === "Stable") {

                        let tokens: string[] = [];
                        let allBalances: any[] = [];

                        for (const currToken of currPooltokens) {
                            tokens.push(currToken.address);
                            allBalances.push(fp(currToken.balance));
                        }

                        let amountIn = Big(amount).times(usdPrice)
                            .div(tokenMap[tokenIn.address][1])
                            .toFixed(18);

                        let amountInAfterFee = fp(Big(amountIn).minus(Big(amountIn).times(currPool.swapFee)).toFixed(18))

                        let tokenOutAmount = Big(
                            calcOutGivenIn(
                                allBalances, (currPool.amp), tokens.indexOf(tokenIn.address), tokens.indexOf(tokenOut.address), amountInAfterFee
                            )
                                .toString())
                            .div(1e18).toFixed(18);

                        let expectedAmount = Big(amountIn).times(tokenMap[tokenIn.address][1]).toFixed(18);

                        let actualAmount = Big(tokenOutAmount.toString()).times(tokenMap[tokenOut.address][1]).toFixed(18);

                        let slipage = Big(expectedAmount).minus(actualAmount).toNumber();

                        const amountInTokenDecimal = swapAmount;

                        const amountOutTokenDecimal = Big(tokenOutAmount).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);
                        // console.log(tokenIn.address)
                        // console.log(tokenOut.address)
                        // console.log(poolId)
                        // console.log("Slipage", slipage)
                        slipage = slipage > 0 ? slipage : 0;

                        graph.addVertex(tokenIn.address);

                        graph.addEdge(tokenIn.address, tokenOut.address, slipage, poolId, amountInTokenDecimal, amountOutTokenDecimal, tokenMap[tokenIn.address][2], tokenMap[tokenOut.address][2], PoolType.balancer);


                    }

                    // console.log('===================================')
                }
            }
        }



        for (let pool of balancerPoolBySynthex) {

            for (let tokenIn of pool.tokens) {

                for (let tokenOut of pool.tokens) {
                    if (tokenIn.address === tokenOut.address) {
                        continue;
                    }
                    let slipage = pool.slipage
                    graph.addVertex(tokenIn.address);
                    graph.addEdge(tokenIn.address, tokenOut.address, slipage, pool.id, '0', '0', tokenIn.decimals, tokenOut.decimals, PoolType.balancer)
                }
            }
        }

        const poolIds = Object.keys(pools);
        // handleSynthexPool(amount, usdPrice, poolIds, pools, graph);
        for (const poolId of poolIds) {

            let synthTokens = Object.keys(pools[poolId]["synths"]);

            for (const tokenIn of synthTokens) {

                for (const tokenOut of synthTokens) {

                    if (tokenIn === tokenOut) {
                        continue;
                    }

                    const burnFee = Big(pools[poolId]["synths"][tokenIn]["burnFee"]).div(1e4).toNumber();
                    const mintFee = Big(pools[poolId]["synths"][tokenOut]["mintFee"]).div(1e4).toNumber();
                    const tokenInPriceUSD = pools[poolId]["synths"][tokenIn]["priceUSD"];
                    const tokenOutPriceUSD = pools[poolId]["synths"][tokenOut]["priceUSD"];

                    if(!tokenMap[tokenIn]) {
                        tokenMap[tokenIn] = [pools[poolId]["synths"][tokenIn]["symbol"], tokenInPriceUSD, 18];
                    }
                   
                    let slipage = Big(amount).times(usdPrice).times(burnFee)
                        .plus(Big(amount).times(usdPrice).times(mintFee)).toNumber();

                    let amountIn = Big(amount).times(usdPrice)
                        .times(1e18).div(tokenInPriceUSD).toFixed(0);

                    let amountOut = Big(Big(amount).times(usdPrice)).minus(slipage)
                        .times(1e18).div(tokenOutPriceUSD).toFixed(0);

                    graph.addVertex(tokenIn);

                    if (kind === SwapType.SwapExactOut) {

                        amountIn = Big(Big(amount).times(usdPrice)).plus(slipage)
                            .times(1e18).div(tokenInPriceUSD).toFixed(0);

                        amountOut = Big(amount).times(usdPrice)
                            .times(1e18).div(tokenOutPriceUSD).toFixed(0);

                    }
                    graph.addEdge(tokenIn, tokenOut, slipage, poolId, amountIn, amountOut, 18, 18, PoolType.synthex)
                }
            }
        }

        const res = graph.dijkstra(t1, t2);

        if (!res || !res[t2] || res[t2]["slipage"] == Infinity) return console.log("no pair has found");

        const outPut: any = [];

        while (true) {
            let currAsset = t2
            outPut.push(res[currAsset])
            if (res[currAsset]["assets"]["assetIn"] != t1) {
                t2 = res[currAsset]["assets"]["assetIn"]
            }
            else {
                break;
            }
        }

        outPut.reverse();

        return  routeProposerHelper(outPut, tokenMap, amount)
      /*  const swapInput = [];
        let assets: string[][] = [];
        let assetsMap: any = {}
        let swapData: any = [];
        let synData: any = [];
        let swapAmount = "0";
        let swapCount = 0;
        let index = 0;
        let tokensDetails = [];
        let asset: string[] = []
        for (let i in outPut) {

            if (outPut[i].poolType === PoolType.balancer) {

                if (synData.length > 0 && +i !== outPut.length - 1) {
                    swapInput.push(synData);
                    assets.push([]);
                    tokensDetails.push({});
                    synData = [];
                }

                if (!assetsMap[outPut[i].assets.assetIn]) {
                    assetsMap[outPut[i].assets.assetIn] = index.toString();
                    asset.push(outPut[i].assets.assetIn);
                    index++;
                }

                if (!assetsMap[outPut[i].assets.assetOut]) {
                    assetsMap[outPut[i].assets.assetOut] = index.toString();
                    asset.push(outPut[i].assets.assetOut)
                    index++;
                }

                if (kind === SwapType.SwapExactIn) {
                    if (swapCount === 0) {
                        // swapAmount = Big(amount).times(10 ** (tokenMap[outPut[i]["assets"]["assetIn"]] ? tokenMap[outPut[i]["assets"]["assetIn"]][2] : 18)).toString();
                        swapAmount = parseFixed(amount, tokenMap[outPut[i]["assets"]["assetIn"]] ? tokenMap[outPut[i]["assets"]["assetIn"]][2] : 18).toString()
                        swapCount = 1;
                    }
                }

                swapData.push(
                    {
                        poolId: outPut[i].pool,
                        assetInIndex: assetsMap[outPut[i].assets.assetIn],
                        assetOutIndex: assetsMap[outPut[i].assets.assetOut],
                        amount: swapAmount,
                        userData: "0x"
                    }
                )
                swapAmount = "0";
            }
            else {

                if (swapData.length > 0 && +i !== outPut.length - 1) {
                    swapInput.push(swapData);
                    assets.push(asset);
                    tokensDetails.push(
                        {
                            priceInUSD: tokenMap[asset[0]][1],
                            priceOutUSD: tokenMap[asset.length - 1][1],
                            decimalsIn: tokenMap[asset[0]][2],
                            decimalsOut: tokenMap[asset.length - 1][2]
                        }
                    )
                    swapData = [];
                    asset = [];
                    assetsMap = {};
                    swapCount = 0;
                }
                synData.push({
                    poolId: outPut[i].pool,
                    assets: outPut[i].assets,
                    amoountIn: outPut[i].amountIn,
                    amountOut: outPut[i].amountOut
                })
            }

            if (+i === outPut.length - 1) {
                if (swapData.length > 0) {
                    swapInput.push(swapData);
                    assets.push(asset);
                    tokensDetails.push(
                        {
                            priceInUSD: tokenMap[asset[0]][1],
                            priceOutUSD: tokenMap[asset[asset.length - 1]][1],
                            decimalsIn: tokenMap[asset[0]][2],
                            decimalsOut: tokenMap[asset[asset.length - 1]][2]
                        }
                    )
                }
                if (synData.length > 0) {
                    swapInput.push(synData);
                    assets.push([]);
                    tokensDetails.push({});
                }
            }
        }
        console.log(outPut);

        // console.log(tokensDetails)
        // console.log(swapInput);
        // console.log(assets);
        // console.log({ swapInput, assets, tokensDetails })
        return { swapInput, assets, tokensDetails }*/
    } catch (error) {
        console.log(error)
    }

}
