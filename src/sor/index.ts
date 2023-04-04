import { BalancerSDK, BalancerSdkConfig, Network, parseFixed, PoolFilter, PoolWithMethods, SOR, TokenPriceProvider } from '@balancer-labs/sdk';
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

            let _tokens = tokens.filter((x) => x != ele1);  // array not containg current token
            if (tokens.length < 2 || !tokenData[tokens.indexOf(ele1)]) {
                continue;
            }

            let _amount = Big(amount).times(10 ** tokenData[tokens.indexOf(ele1)][2]).toString();

            for (let ele2 of _tokens) {
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

b("20", "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1");

export async function b(amount: any, t1: string, t2: string) {
    try {

        if (isNaN(Number(amount)) || Number(amount) < 0) {
            return console.log("AMOUNT_NOT_VALID")
        }

        let usdPrice: any;
        let allPools: any;

        try {

            let promise = await Promise.all(
                [
                    axios.get(`https://api.coingecko.com/api/v3/coins/arbitrum-one/contract/${t1}`),
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
        // console.log(allPools)
        t1 = t1.toLowerCase();
        t2 = t2.toLowerCase();
        console.log(usdPrice)
        if (!usdPrice || !allPools) {
            console.log("Pair is not available")
        }

        let graph = new Graph(25);

        // let count = 0;

        let input: any = [];
 
        let AllTokens: any = [];
        let AllTokensData: any = [];

        for (let ele of allPools) {

            // if (count >= 30) {
            //     break
            // }
            // count++;
            let id = ele.id;
            let tokens: any[] = [];
            let tokenData: any[][] = [];

            for (let token of ele.tokens) {

                if (!token.token?.latestUSDPrice) {
                    break;
                }
                tokens.push(token.address);
                tokenData.push([token.symbol, token.token?.latestUSDPrice, token.decimals, id]);
            }

            AllTokens.push(tokens);
            AllTokensData.push(tokenData);

            for (let ele1 of tokens) {

                let _tokens = tokens.filter((x) => x != ele1);  // array not containg current token
                if (tokens.length < 2 || !tokenData[tokens.indexOf(ele1)]) {
                    continue;
                }

                let _amount = Big(amount).times(usdPrice)
                    .times(10 ** tokenData[tokens.indexOf(ele1)][2])
                    .div(tokenData[tokens.indexOf(ele1)][1])
                    .toFixed(0);
                
                for (let ele2 of _tokens) {

                    input.push(swaps.queryBatchSwap(
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
                    ));
                }
            }
        }

        let query: any = await Promise.allSettled(input);

        let _count = 0;

        for (let i in AllTokens) {

            for (let ele1 of AllTokens[i]) {

                let _tokens = AllTokens[i].filter((x: any) => x != ele1);

                let _amount = Big(amount).times(usdPrice)
                    .times(10 ** AllTokensData[i][AllTokens[i].indexOf(ele1)][2])
                    .div(AllTokensData[i][AllTokens[i].indexOf(ele1)][1])
                    .toFixed(0);

                for (let ele2 of _tokens) {

                    if (query[_count]["status"] != "fulfilled") {
                        _count++;
                        continue;
                    }

                    let res = query[_count]["value"].sort((a: any, b: any) => Number(a) - Number(b));

                    _count++;

                    const expectedAmount = Big(_amount)
                        .div((10 ** AllTokensData[i][AllTokens[i].indexOf(ele1)][2]))
                        .times(AllTokensData[i][AllTokens[i].indexOf(ele1)][1]).toNumber();

                    // console.log(AllTokensData[i][AllTokens[i].indexOf(ele1)][0],
                    //     AllTokensData[i][AllTokens[i].indexOf(ele2)][0]
                    // )
                    // console.log(expectedAmount, "ES");

                    let actualAmount = Big(Math.abs(Number(res[0])))
                        .div(10 ** AllTokensData[i][AllTokens[i].indexOf(ele2)][2])
                        .times(AllTokensData[i][AllTokens[i].indexOf(ele2)][1]).toNumber();

                    // console.log(actualAmount, "AS")
                    let slipage = Big(expectedAmount).minus(actualAmount)
                        .toNumber();

                    // console.log("amount", _amount)
                    // console.log("slipage", slipage);
                    slipage = slipage > 0 ? slipage : 0;
                    
                    if (!slipage) slipage = 0;
                    graph.addVertex(ele1);

                    graph.addEdge(ele1, ele2, slipage, AllTokensData[i][AllTokens[i].indexOf(ele2)][3], _amount);

                }
                // console.log("===============")

            }


        }

        let res = await graph.dijkstra(t1, Big(usdPrice).times(amount).toNumber(), t2);

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
