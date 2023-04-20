import { SwapType } from "@balancer-labs/sdk";
import { parseFixed } from "@ethersproject/bignumber";
import { PoolType } from "../../graph/graph";
import { calcTokenInTokenOut } from "./calcTokenInTokenOut";







export function routeSeperator(outPut: any, tokenMap: any, kind: SwapType, slipage: number) {
    try {

        let swapInput = [];
        let assets: string[][] = [];
        let assetsMap: any = {}
        let swapData: any = [];
        let synData: any = [];
        let index = 0;
        let asset: string[] = []
        for (let i in outPut) {

            if (outPut[i].poolType !== PoolType.Synthex) {

                // if (synData.length > 0) {
                //     swapInput.push(synData);
                //     assets.push([]);
                //     synData = [];
                //     index = 0;
                // }

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

                swapData.push(
                    {
                        poolId: outPut[i].pool,
                        assetInIndex: assetsMap[outPut[i].assets.assetIn],
                        assetOutIndex: assetsMap[outPut[i].assets.assetOut],
                        amountIn: outPut[i].amountIn,
                        amountOut: outPut[i].amountOut,
                        parameters: outPut[i].parameters,
                        userData: "0x",
                        assets: outPut[i].assets,
                        // isBalancerPool: true,
                        poolType: outPut[i].poolType,
                        swapFee: outPut[i].swapFee,
                    }
                )

            }
            else {

                if (swapData.length > 0) {
                    swapInput.push(swapData);
                    assets.push(asset);
                    swapData = [];
                    asset = [];
                    assetsMap = {};
                    index = 0;
                };

                synData.push({
                    poolId: outPut[i].pool,
                    assetInIndex: 0,
                    assetOutIndex: 1,
                    amountIn: outPut[i].amountIn,
                    amountOut: outPut[i].amountOut,
                    parameters: outPut[i].parameters,
                    userData: "0x",
                    assets: outPut[i].assets,
                    // isBalancerPool: false,
                    poolType: outPut[i].poolType,
                    slipage: outPut[i].slipage,
                });

                swapInput.push(synData);
                assets.push([outPut[i].assets.assetIn, outPut[i].assets.assetOut]);
                synData = [];
                index = 0;
            }

            if (+i === outPut.length - 1) {
                if (swapData.length > 0) {
                    swapInput.push(swapData);
                    assets.push(asset);
                }
                // if (synData.length > 0) {
                //     swapInput.push(synData);
                //     assets.push([]);
                // }
            }
        }

        swapInput = calcTokenInTokenOut(swapInput, assets, kind, tokenMap, slipage)
        return { swapInput, assets, tokenMap }
    }
    catch (error) {
        console.log("Error @ routeProposerHelper", error)
    }
}