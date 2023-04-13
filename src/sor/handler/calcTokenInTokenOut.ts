import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { PoolType } from "../../graph/graph";
import { BigNumberish, fp } from "../../math/numbers";
import { stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../math/stablePool1";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../math/wieghtedPool";





export function calcTokenInTokenOut(output: any, assets: any, kind: SwapType, tokenMap: any) {
    try {
        const updatedOutput: any = [];
        let j = 0;
        
        for (let pools of output) {
           
        
            if (pools[0].poolType !== PoolType.Synthex) {

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;
                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {
                            const amount = fp(Big(amountOut).minus(Big(amountOut).times(pools[i].swapFee)).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;

                            amountOut = Big(stablePoolcalcOutGivenIn(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish]).toString())
                                .div(1e18).times(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(0);

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                            pools[i]["amount"] = "0";

                        }
                        else if (pools[i].poolType === PoolType.Weighted) {
                            const amount = amountOut;

                            pools[i].parameters[0] = amount

                            amountOut = Big(weightedPoolTokenInForTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsOut"]).toFixed(0)

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                            pools[i]["amount"] = "0";
                        }

                        if (+i === pools.length - 1) {
                            pools[0]["amount"] = amountIn;
                        }

                    }
                    updatedOutput.push(pools)
                    pools.push({
                        amountIn, amountOut
                    });

                }

                else if (kind === SwapType.SwapExactOut) {
                    // assets[j].reverse();
                    pools.reverse();
                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;
                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {

                            //amountOut
                            const amount = fp(Big(amountIn).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;

                            amountIn = Big(stablePoolcalcInGivenOut(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish]).toString())
                                .div(1e18).times(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(0);

                            amountIn = Big(amountIn).plus(Big(amountIn).times(pools[i].swapFee)).toFixed(0);
                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                            pools[i]["amount"] = "0";

                        }
                        else if (pools[i].poolType === PoolType.Weighted) {
                            const amount = amountIn;

                            pools[i].parameters[0] = amount

                            amountIn = Big(weightedPoolTokenInForExactTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsIn"]).toFixed(0)

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                            pools[i]["amount"] = "0";
                        }

                        if (+i === pools.length - 1) {
                            pools[0]["amount"] = amountOut;
                        }

                    }
                    updatedOutput.push(pools)
                    pools.push({
                        amountIn, amountOut
                    });
                }


            }
            j++
        
        }

        // console.log("calc", updatedOutput);

        return updatedOutput

    }
    catch (error) {
        console.log("Error @ calcTokenInTokenOut", error);
    }
}