import { BalancerSDK, BalancerSdkConfig, Network, parseFixed, PoolFilter, PoolWithMethods, SOR, SwapType, TokenPriceProvider } from '@balancer-labs/sdk';
import { parseEther } from 'ethers/lib/utils';
import Big from 'big.js'
import { Graph, PoolType } from '../graph/graph';
import axios from 'axios';
import { ethers } from 'ethers';
import { queryStr } from '../helper/query';
import { balancerPoolBySynthex, synthexPools, TokenMap } from '../helper/constant';
import { fetchOracleData } from '../helper/getOracleDetails';
import { promises as fs } from "fs";
import path from "path";
import { weightedPoolTokenInForTokenOut } from '../math/wieghtedPool';
import { bnum } from '../utils/bigNumber';


const config: BalancerSdkConfig = {
    network: Network.ARBITRUM,
    rpcUrl: "https://arb1.arbitrum.io/rpc"                             //"https://endpoints.omniatech.io/v1/arbitrum/one/public",
};
const balancer = new BalancerSDK(config);

const { swaps } = balancer

// setInterval(() => {
//     swaps.fetchPools()
//     // console.log("FETCH Pool working")
// }, 10 * 1000)
// 0x539bdE0d7Dbd336b79148AA742883198BBF60342   0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1  0x3082CC23568eA640225c2467653dB90e9250AaA0

routeProposer("100", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", "0x3082CC23568eA640225c2467653dB90e9250AaA0", 0);


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
        // await swaps.fetchPools()
        // const route = await balancer.swaps.findRouteGivenIn({
        //     tokenIn: t1,
        //     tokenOut: t2,
        //     // amount: parseEther("1"),
        //     amount: ethers.BigNumber.from("100000000"),
        //     gasPrice: parseFixed("1", 9),
        //     maxPools: 3,
        // });
        // console.log(route)
        //   return

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
                    fetchOracleData(),
                    swaps.fetchPools()
                ]);

            usdPrice = promise[0]?.value?.data.market_data?.current_price?.usd;
            allPools = promise[1]?.value?.data.data.pools
        }
        catch (error: any) {
            return console.log(error);
        }
        // console.log(allPools)
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

        if (!allPools) return console.log("PLEAE_TRY_AGAIN");

        const graph = new Graph();

        const queryInput: any = [];

        const allTokens: any = [];

        let tokenMap: TokenMap = {};
        let count = 0;
        for (const currPool of allPools) {

            const poolId = currPool.id;
            const currPooltokens: any[] = [];
            const currPoolTokensAdd: any = []

            for (const token of currPool.tokens) {

                if (!token.token?.latestUSDPrice) {
                    break;
                }
                currPooltokens.push(token);
                currPoolTokensAdd.push(token.address)
                tokenMap[token.address] = [token.symbol, token.token?.latestUSDPrice, token.decimals]
            }
            count++
            allTokens.push([currPooltokens, poolId]);

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
                    // id: string;
                    // address: string;
                    // poolType: PoolTypes;
                    // swapFee: BigNumber;
                    // tokenIn: string;
                    // tokenOut: string;
                    // decimalsIn: number;
                    // decimalsOut: number;
                    // balanceIn: BigNumber;
                    // balanceOut: BigNumber;

                    if (currPool.poolType === "Weighted") {
                      console.log(tokenIn, tokenOut)
                       let w =  weightedPoolTokenInForTokenOut((swapAmount),
                            {
                                balanceIn: bnum(tokenIn.balance),
                                balanceOut:bnum( tokenOut.balance),
                                decimalsIn: bnum(tokenIn.decimals),
                                decimalsOut: bnum(tokenOut.decimals),
                                weightIn: bnum(tokenIn.weight),
                                weightOut: bnum(tokenOut.weight),
                                swapFee: bnum(currPool.swapFee)
                            });

                            console.log("weighted",w.toString(),count )
                    }
                    queryInput.push(swaps.queryBatchSwap(
                        {
                            swaps: [
                                {
                                    poolId: poolId,
                                    assetInIndex: currPoolTokensAdd.indexOf(tokenIn.address),
                                    assetOutIndex: currPoolTokensAdd.indexOf(tokenOut.address),
                                    amount: swapAmount,
                                    userData: "0x"
                                }],
                            assets: currPoolTokensAdd,
                            kind: kind,
                        },
                    ));
                }
            }
        }

        const queryRes: any = await Promise.allSettled(queryInput);
        // console.log(allPools)

        let _count: number = 0;

        for (const tokens of allTokens) {

            for (const tokenIn of tokens[0]) {

                for (const tokenOut of tokens[0]) {

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

                    if (queryRes[_count]["status"] != "fulfilled") {
                        _count++;
                        continue;
                    }

                    const res = queryRes[_count]["value"].sort((a: any, b: any) => Number(a) - Number(b));

                    _count++;
                    console.log(res)
                    let expectedAmount = Big(swapAmount)
                        .div((10 ** tokenMap[tokenIn.address][2]))
                        .times(tokenMap[tokenIn.address][1]).toNumber();

                    let actualAmount = Big(Math.abs(Number(res[0])))
                        .div(10 ** tokenMap[tokenOut.address][2])
                        .times(tokenMap[tokenOut.address][1]).toNumber();

                    if (kind === SwapType.SwapExactOut) {

                        expectedAmount = Big(swapAmount)
                            .div((10 ** tokenMap[tokenOut.address][2]))
                            .times(tokenMap[tokenOut.address][1]).toNumber();

                        actualAmount = Big(Math.abs(Number(res[res.length - 1])))
                            .div(10 ** tokenMap[tokenIn.address][2])
                            .times(tokenMap[tokenIn.address][1]).toNumber();
                    }
                    // console.log(tokenMap[tokenIn][0],
                    //     tokenMap[tokenOut][0]
                    // )
                    // console.log(expectedAmount, "ES");

                    // console.log(actualAmount, "AS")
                    let slipage = Big(expectedAmount).minus(actualAmount)
                        .toNumber();

                    if (kind === SwapType.SwapExactOut) {
                        slipage = Big(actualAmount).minus(expectedAmount)
                            .toNumber();
                        slipage = slipage > 0 ? slipage : 0;
                    }

                    // console.log("amount", swapAmount)
                    // console.log("slipage", slipage);
                    slipage = slipage > 0 ? slipage : 0;
                    const amountIn = res[res.length - 1];
                    const amountOut = Math.abs(res[0]).toString()
                    if (!slipage) slipage = 0;
                    graph.addVertex(tokenIn.address);

                    graph.addEdge(tokenIn.address, tokenOut.address, slipage, tokens[1], amountIn, amountOut, tokenMap[tokenIn.address][2], tokenMap[tokenOut.address][2], PoolType.balancer);

                }
                // console.log("===============");
            }
        }

        // for (let pool of balancerPoolBySynthex) {

        //     for (let tokenIn of pool.tokens) {

        //         for (let tokenOut of pool.tokens) {
        //             if (tokenIn.address === tokenOut.address) {
        //                 continue;
        //             }
        //             let slipage = pool.slipage
        //             graph.addVertex(tokenIn.address);
        //             graph.addEdge(tokenIn.address, tokenOut.address, slipage, pool.id, '0', '0', tokenIn.decimals, tokenOut.decimals, PoolType.balancer)
        //         }
        //     }
        // }

        const poolIds = Object.keys(pools);

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

        const res = await graph.dijkstra(t1, t2);

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
        const swapInput = [];
        const assets: string[] = [];
        const assetsMap: any = {}
        let swapData: any = [];
        let synData: any = [];
        let swapAmount = "0";
        let swapCount = 0;
        let index = 0;
        for (let i in outPut) {

            if (outPut[i].poolType === PoolType.balancer) {

                if (synData.length > 0 && +i !== outPut.length - 1) {
                    swapInput.push(synData);
                    synData = [];
                }

                if (!assetsMap[outPut[i].assets.assetIn]) {
                    assetsMap[outPut[i].assets.assetIn] = index.toString();
                    assets.push(outPut[i].assets.assetIn);
                    index++;
                }

                if (!assetsMap[outPut[i].assets.assetOut]) {
                    assetsMap[outPut[i].assets.assetOut] = index.toString();
                    assets.push(outPut[i].assets.assetOut)
                    index++;
                }

                if (kind === SwapType.SwapExactIn) {
                    if (swapCount === 0) {
                        swapAmount = Big(amount).times(10 ** (tokenMap[outPut[i]["assets"]["assetIn"]] ? tokenMap[outPut[i]["assets"]["assetIn"]][2] : 18)).toString();
                        swapCount = 1;
                    }
                }

                // else if(kind === SwapType.SwapExactOut){
                //     if(+i === outPut.length - 1) {
                //         swapAmount = Big(amount).times(10** tokenMap[t2][2]).toString()
                //     }
                // }

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
                    swapData = [];
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
                if (swapData.length > 0) swapInput.push(swapData);
                if (synData.length > 0) swapInput.push(synData);
            }
        }
        console.log(outPut)

        // console.log(swapInput);
        // console.log(assets)
        return { swapInput, assets }
    } catch (error) {
        console.log(error)
    }

}
