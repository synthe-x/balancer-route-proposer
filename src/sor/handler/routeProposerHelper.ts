import { parseFixed } from "@ethersproject/bignumber";
import { PoolType } from "../../graph/graph";





export function routeProposerHelper(outPut: any, tokenMap: any, amount: string) {
    try {

        const swapInput = [];
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

                // if (kind === SwapType.SwapExactIn) {
                if (swapCount === 0) {
                    // swapAmount = Big(amount).times(10 ** (tokenMap[outPut[i]["assets"]["assetIn"]] ? tokenMap[outPut[i]["assets"]["assetIn"]][2] : 18)).toString();
                    swapAmount = parseFixed(amount, tokenMap[outPut[i]["assets"]["assetIn"]] ? tokenMap[outPut[i]["assets"]["assetIn"]][2] : 18).toString()
                    swapCount = 1;
                }
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

        return { swapInput, assets, tokensDetails }
    }
    catch (error) {
        console.log("Error @ routeProposerHelper", error)
    }
}