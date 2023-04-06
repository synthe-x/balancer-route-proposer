import { BalancerSDK, BalancerSdkConfig, Network, parseFixed, PoolFilter, PoolWithMethods, SOR, SwapType, TokenPriceProvider } from '@balancer-labs/sdk';
import { parseEther } from 'ethers/lib/utils';
import Big from 'big.js'
import { Graph } from '../graph/graph';
import axios from 'axios';
import { ethers } from 'ethers';
import { queryStr } from '../helper/query';
import { balancerPoolBySynthex, synthexPools, TokenMap } from '../helper/constant';
import { fetchOracleData } from '../helper/getOracleDetails';
import { promises as fs } from "fs";
import path from "path";


const config: BalancerSdkConfig = {
    network: Network.ARBITRUM,
    rpcUrl: "https://arb1.arbitrum.io/rpc"                             //"https://endpoints.omniatech.io/v1/arbitrum/one/public",
};
const balancer = new BalancerSDK(config);

const { swaps } = balancer

setInterval(() => {
    swaps.fetchPools()
    // console.log("FETCH Pool working")
}, 10 * 1000)
// 0x539bdE0d7Dbd336b79148AA742883198BBF60342   0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1  0x3082CC23568eA640225c2467653dB90e9250AaA0

routeProposer("100", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", "0x3082CC23568eA640225c2467653dB90e9250AaA0", 0);


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

        // const route =await balancer.swaps.findRouteGivenIn({
        //     tokenIn: t1,
        //     tokenOut: t2,
        //     // amount: parseEther("1"),
        //     amount: ethers.BigNumber.from("100000000"),
        //     gasPrice: parseFixed("1",9),
        //     maxPools: 3,
        //   });
        //   console.log(route)
        //   return

        try {

            const promise: any = await Promise.allSettled(
                [
                    axios.get(`https://api.coingecko.com/api/v3/coins/arbitrum-one/contract/${kind == SwapType.SwapExactIn ? t1 : t2}`),
                    axios({
                        method: "post",
                        url: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
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
            return console.log(error.response.data);
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

        const allTokens: string[][] = [];

        let tokenMap: TokenMap = {};

        for (const currPool of allPools) {

            if(currPool.id === "0xfb5e6d0c1dfed2ba000fbc040ab8df3615ac329c000000000000000000000159") {
                console.log(currPool.tokens)
            }
            const poolId = currPool.id;
            const currPooltokens: string[] = [];

            for (const token of currPool.tokens) {

                if (!token.token?.latestUSDPrice) {
                    break;
                }
                currPooltokens.push(token.address);
                tokenMap[token.address] = [token.symbol, token.token?.latestUSDPrice, token.decimals, poolId]
            }

            allTokens.push([currPooltokens, poolId]);

            for (const tokenIn of currPooltokens) {

                if (currPooltokens.length < 2 || !tokenMap[tokenIn]) {
                    continue;
                }

                for (const tokenOut of currPooltokens) {

                    if (tokenIn === tokenOut) {
                        continue;
                    }

                    let swapAmount = Big(amount).times(usdPrice)
                        .times(10 ** tokenMap[tokenIn][2])
                        .div(tokenMap[tokenIn][1])
                        .toFixed(0);

                    if (kind === SwapType.SwapExactOut) {
                        swapAmount = Big(amount).times(usdPrice)
                            .times(10 ** tokenMap[tokenOut][2])
                            .div(tokenMap[tokenOut][1])
                            .toFixed(0);
                    }
                    queryInput.push(swaps.queryBatchSwap(
                        {
                            swaps: [
                                {
                                    poolId: poolId,
                                    assetInIndex: currPooltokens.indexOf(tokenIn),
                                    assetOutIndex: currPooltokens.indexOf(tokenOut),
                                    amount: swapAmount,
                                    userData: "0x"
                                }],
                            assets: currPooltokens,
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

                    if (tokenIn === tokenOut) {
                        continue;
                    }

                    let swapAmount = Big(amount).times(usdPrice)
                        .times(10 ** tokenMap[tokenIn][2])
                        .div(tokenMap[tokenIn][1])
                        .toFixed(0);

                    if (kind === SwapType.SwapExactOut) {
                        swapAmount = Big(amount).times(usdPrice)
                            .times(10 ** tokenMap[tokenOut][2])
                            .div(tokenMap[tokenOut][1])
                            .toFixed(0);
                    }

                    if (queryRes[_count]["status"] != "fulfilled") {
                        _count++;
                        continue;
                    }

                    const res = queryRes[_count]["value"].sort((a: any, b: any) => Number(a) - Number(b));

                    _count++;
                    // console.log(res)
                    let expectedAmount = Big(swapAmount)
                        .div((10 ** tokenMap[tokenIn][2]))
                        .times(tokenMap[tokenIn][1]).toNumber();

                    let actualAmount = Big(Math.abs(Number(res[0])))
                        .div(10 ** tokenMap[tokenOut][2])
                        .times(tokenMap[tokenOut][1]).toNumber();

                    if (kind === SwapType.SwapExactOut) {

                        expectedAmount = Big(swapAmount)
                            .div((10 ** tokenMap[tokenOut][2]))
                            .times(tokenMap[tokenOut][1]).toNumber();

                        actualAmount = Big(Math.abs(Number(res[res.length - 1])))
                            .div(10 ** tokenMap[tokenIn][2])
                            .times(tokenMap[tokenIn][1]).toNumber();
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
                    graph.addVertex(tokenIn);

                    graph.addEdge(tokenIn, tokenOut, slipage, tokens[1], amountIn, amountOut, tokenMap[tokenIn][2], tokenMap[tokenOut][2]);

                }
                // console.log("===============");
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
                    graph.addEdge(tokenIn.address, tokenOut.address, slipage, pool.id, '0', '0', tokenIn.decimals, tokenOut.decimals)
                }
            }
        }

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
                    graph.addEdge(tokenIn, tokenOut, slipage, poolId, amountIn, amountOut, 18, 18)
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

        console.log(outPut)
        return outPut
    } catch (error) {
        console.log(error)
    }


}
boil debate alcohol law sphere robot drop lounge drill stool lift dress