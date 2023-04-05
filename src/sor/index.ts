import { BalancerSDK, BalancerSdkConfig, Network, parseFixed, PoolFilter, PoolWithMethods, SOR, SwapType, TokenPriceProvider } from '@balancer-labs/sdk';
import { parseEther } from 'ethers/lib/utils';
import Big from 'big.js'
import { Graph } from '../graph/graph';
import axios from 'axios';
import { ethers } from 'ethers';
import { queryStr } from '../helper/query';




const config: BalancerSdkConfig = {
    network: Network.ARBITRUM,
    rpcUrl: "https://rpc.ankr.com/arbitrum"                             //"https://endpoints.omniatech.io/v1/arbitrum/one/public",
};
const balancer = new BalancerSDK(config);

const { swaps, provider } = balancer


//  let sor = new SOR(provider, )

/*
export async function a(amount: any, t1: string, t2: string) {


    let allPools = await balancer.pools.all();
    let graph = new Graph(allPools.length);

    let count = 0;
    for (let ele of allPools) {

        if (count > 1) {
            break
        }
        count++;
        let id = ele.id;

        let tokens: any[] = [];
        let tokenData: any[][] = [];

        for (let token of ele.tokens) {
            tokens.push(token.address)
            if (!token.token?.latestUSDPrice) {
                break;
            }
            tokenData.push([token.symbol, token.token.latestUSDPrice, token.decimals])
        }

        console.log(tokenData)
        for (let ele1 of tokens) {

            let tokensExceptCurrentToken = tokens.filter((x) => x != ele1);  // array not containg current token
            if (tokens.length < 2 || !tokenData[tokens.indexOf(ele1)]) {
                continue;
            }

            let _amount = Big(amount).times(10 ** tokenData[tokens.indexOf(ele1)][2]).toString();

            for (let ele2 of tokensExceptCurrentToken) {
                let query;

                console.log(
                    {
                        poolId: id,
                        assetInIndex: tokens.indexOf(ele1),
                        assetOutIndex: tokens.indexOf(ele2),
                        amount: _amount,
                        userData: "0x"
                    },
                    tokens
                )

                if (!tokenData[tokens.indexOf(ele2)] || !tokenData[tokens.indexOf(ele1)]) {
                    continue;
                }

                try {
                    query = await swaps.queryBatchSwap(
                        {
                            swaps: [
                                {
                                    poolId: id,
                                    assetInIndex: tokens.indexOf(ele1),
                                    assetOutIndex: tokens.indexOf(ele2),
                                    amount: _amount,
                                    userData: "0x"
                                }],
                            assets: tokens,
                            kind: 0,
                        },
                    );
                }
                catch (error: any
                ) {
                    console.log("Error", ele1, ele2);
                }
                if (!query) {
                    continue;
                }

                query = query.sort((a: any, b: any) => Number(a) - Number(b));
                console.log(query);

                const expectedAmount = Big(_amount)
                    .div((10 ** tokenData[tokens.indexOf(ele1)][2])).
                    times(tokenData[tokens.indexOf(ele1)][1]).toNumber();
                console.log(expectedAmount, "ES");

                let actualAmount = Big(Math.abs(Number(query[0])))
                    .div(10 ** tokenData[tokens.indexOf(ele2)][2])
                    .times(tokenData[tokens.indexOf(ele2)][1]).toNumber();
                console.log(actualAmount, "AS")
                let slipage = Big(expectedAmount).minus(actualAmount).toNumber();

                console.log("slipage", slipage)
                slipage = slipage < 0 ? 0 : slipage;

                if (!slipage) slipage = 0;
                graph.addVertex(ele1);

                graph.addEdge(ele1, ele2, slipage, id)

            }
            console.log("===========================================")
        }





    }
    // 0xda10009cbd5d07dd0cecc66161fc93d7c9000da1 dai
    // 0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9 usdt

    let res = await graph.dijkstra(t1, t2);
    // console.log(res)

    if (!res[t2] || res[t2]["slipage"] == Infinity) {
        return console.log("no pair has found")
    }

    let outPut: any = [];
    while (true) {
        let currAsset = t2
        outPut.push(res[currAsset])
        if (res[currAsset]["asset"][0] != t1) {
            t2 = res[currAsset]["asset"][0]
        }
        else {
            break;
        }
    }
    console.log(outPut)
    return outPut

}*/

// 0x539bdE0d7Dbd336b79148AA742883198BBF60342

routeProposer("100", "0x3082CC23568eA640225c2467653dB90e9250AaA0", "0x539bdE0d7Dbd336b79148AA742883198BBF60342", 0);


export async function routeProposer(amount: any, t1: string, t2: string, kind: SwapType): Promise<any> {
    try {

        if (isNaN(Number(amount)) || Number(amount) < 0) {
            return console.log("AMOUNT_NOT_VALID")
        }

        if (kind != SwapType.SwapExactIn && kind != SwapType.SwapExactOut) {
            return console.log("KIND_NOT_VALID")
        }
        ethers
        let usdPrice: any;
        let allPools: any;

        try {

            let promise = await Promise.all(
                [
                    axios.get(`https://api.coingecko.com/api/v3/coins/arbitrum-one/contract/${kind == SwapType.SwapExactIn ? t1 : t2}`),
                    axios({
                        method: "post",
                        url: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
                        data:
                        {
                            query: queryStr
                        }
                    })
                ]);

            usdPrice = promise[0]?.data.market_data?.current_price?.usd;
            allPools = promise[1].data.data.pools
        }
        catch (error: any) {
            return console.log(error.response.data)
        }

        t1 = t1.toLowerCase();
        t2 = t2.toLowerCase();

        console.log(usdPrice)
        if (!usdPrice) {
            console.log("PAIR_NOT_AVAILABLE")
        }

        if (!allPools) {
            return console.log("PLEAE_TRY_AGAIN");
        }

        let graph = new Graph();

        let queryInput: any = [];

        let AllTokens: string[][] = [];

        let AllTokensData: any = [];

        // let tokenMap:<string> = {};

        for (let currPool of allPools) {

            let poolId = currPool.id;
            let currPooltokens: string[] = [];
            let currPooltokensData: any[][] = [];

            for (let token of currPool.tokens) {

                if (!token.token?.latestUSDPrice) {
                    break;
                }
                currPooltokens.push(token.address);
                currPooltokensData.push([token.symbol, token.token?.latestUSDPrice, token.decimals, poolId]);

            }

            AllTokens.push(currPooltokens);
            AllTokensData.push(currPooltokensData);

            for (let tokenIn of currPooltokens) {

                let tokensExceptTokenIn = currPooltokens.filter((x) => x != tokenIn);
                if (currPooltokens.length < 2 || !currPooltokensData[currPooltokens.indexOf(tokenIn)]) {
                    continue;
                }

                for (let tokenOut of tokensExceptTokenIn) {

                    let swapAmount = Big(amount).times(usdPrice)
                        .times(10 ** currPooltokensData[currPooltokens.indexOf(tokenIn)][2])
                        .div(currPooltokensData[currPooltokens.indexOf(tokenIn)][1])
                        .toFixed(0);

                    if (kind === SwapType.SwapExactOut) {
                        swapAmount = Big(amount).times(usdPrice)
                            .times(10 ** currPooltokensData[currPooltokens.indexOf(tokenOut)][2])
                            .div(currPooltokensData[currPooltokens.indexOf(tokenOut)][1])
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

        let queryRes: any = await Promise.allSettled(queryInput);

        let _count = 0;

        for (let i in AllTokens) {

            for (let tokenIn of AllTokens[i]) {

                let tokensExceptTokenIn = AllTokens[i].filter((x: any) => x != tokenIn);

                for (let tokenOut of tokensExceptTokenIn) {

                    let swapAmount = Big(amount).times(usdPrice)
                        .times(10 ** AllTokensData[i][AllTokens[i].indexOf(tokenIn)][2])
                        .div(AllTokensData[i][AllTokens[i].indexOf(tokenIn)][1])
                        .toFixed(0);

                    if (kind === SwapType.SwapExactOut) {
                        swapAmount = Big(amount).times(usdPrice)
                            .times(10 ** AllTokensData[i][AllTokens[i].indexOf(tokenOut)][2])
                            .div(AllTokensData[i][AllTokens[i].indexOf(tokenOut)][1])
                            .toFixed(0);
                    }

                    if (queryRes[_count]["status"] != "fulfilled") {
                        _count++;
                        continue;
                    }

                    let res = queryRes[_count]["value"].sort((a: any, b: any) => Number(a) - Number(b));

                    _count++;
                    
                    let expectedAmount = Big(swapAmount)
                        .div((10 ** AllTokensData[i][AllTokens[i].indexOf(tokenIn)][2]))
                        .times(AllTokensData[i][AllTokens[i].indexOf(tokenIn)][1]).toNumber();

                    let actualAmount = Big(Math.abs(Number(res[0])))
                        .div(10 ** AllTokensData[i][AllTokens[i].indexOf(tokenOut)][2])
                        .times(AllTokensData[i][AllTokens[i].indexOf(tokenOut)][1]).toNumber();

                    if (kind === SwapType.SwapExactOut) {

                        expectedAmount = Big(swapAmount)
                            .div((10 ** AllTokensData[i][AllTokens[i].indexOf(tokenOut)][2]))
                            .times(AllTokensData[i][AllTokens[i].indexOf(tokenOut)][1]).toNumber();

                        actualAmount = Big(Math.abs(Number(res[res.length - 1])))
                            .div(10 ** AllTokensData[i][AllTokens[i].indexOf(tokenIn)][2])
                            .times(AllTokensData[i][AllTokens[i].indexOf(tokenIn)][1]).toNumber();
                    }
                    // console.log(AllTokensData[i][AllTokens[i].indexOf(tokenIn)][0],
                    //     AllTokensData[i][AllTokens[i].indexOf(tokenOut)][0]
                    // )
                    // console.log(expectedAmount, "ES");

                    // console.log(actualAmount, "AS")
                    let slipage = Big(expectedAmount).minus(actualAmount)
                        .toNumber();

                    if (kind === SwapType.SwapExactOut) {
                        slipage = Big(actualAmount).minus(expectedAmount)
                            .toNumber();
                    }

                    // console.log("amount", swapAmount)
                    // console.log("slipage", slipage);
                    slipage = slipage > 0 ? slipage : 0;

                    if (!slipage) slipage = 0;
                    graph.addVertex(tokenIn);

                    graph.addEdge(tokenIn, tokenOut, slipage, AllTokensData[i][AllTokens[i].indexOf(tokenOut)][3], swapAmount);

                }
                // console.log("===============");

            }


        }

        let res = await graph.dijkstra(t1, t2);

        if (!res || !res[t2] || res[t2]["slipage"] == Infinity) {
            return console.log("no pair has found")
        }

        let outPut: any = [];
        while (true) {
            let currAsset = t2
            outPut.push(res[currAsset])
            if (res[currAsset]["asset"][0] != t1) {
                t2 = res[currAsset]["asset"][0]
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
