import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { PoolType } from "../../graph/graph";
import { BigNumberish, fp } from "../../math/numbers";
import { stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../math/stablePool1";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../math/wieghtedPool";





export function calcTokenInTokenOut(output: any, assets: any, kind: SwapType, tokenMap: any) {
    try {
        const updatedOutput: any = [];
        if (kind === SwapType.SwapExactOut) {
            output.reverse();
        }

        for (let pools of output) {


            if (pools[0].poolType !== PoolType.Synthex) {

                if (updatedOutput.length > 0) {
                    const l = updatedOutput.length - 1;
                    const lastArr = updatedOutput[l]

                    if (kind === SwapType.SwapExactOut) {
                        // pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    }
                    else if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];

                    }
                }

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

                            pools[i].parameters[0] = amount;

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

                    pools.push({
                        amountIn, amountOut
                    });
                    updatedOutput.push(pools);

                }

                else if (kind === SwapType.SwapExactOut) {

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
            else if (pools[0].poolType === PoolType.Synthex) {

                if (updatedOutput.length > 0) {
                    const l = updatedOutput.length - 1;
                    const lastArr = updatedOutput[l]
                    if (kind === SwapType.SwapExactOut) {
                        // pools[0].amountIn = lastArr[lastArr.length - 1]["amountIn"];
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    }
                    else if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                        // pools[0].amountOut = lastArr[lastArr.length - 1]["amountOut"];
                    }

                }

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;

                    for (let i in pools) {
                        const amountUSD = Big(amountOut).times(tokenMap[pools[i]['assets']['assetIn']][1]).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountOut = Big(Big(amountUSD).minus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetOut']][1]).times(1e18).toFixed(0);
                        delete pools[i]["poolType"];
                        delete pools[i]["parameters"];
                        pools[i].amountIn = amountIn;
                        pools[i].amountOut = amountOut;
                        pools[i].slipage = slipageUSD;
                    }
                    updatedOutput.push(pools)
                }
                else if (kind === SwapType.SwapExactOut) {
                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;

                    for (let i in pools) {

                        const amountUSD = Big(amountIn).times(tokenMap[pools[i]['assets']['assetOut']][1]).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(0);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountIn = Big(Big(amountUSD).plus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetIn']][1]).times(1e18).toFixed(0);
                        delete pools[i]["poolType"];
                        delete pools[i]["parameters"];
                        pools[i].amountIn = amountIn;
                        pools[i].amountOut = amountOut;
                        pools[i].slipage = slipageUSD;
                    }
                    updatedOutput.push(pools)

                }

            }

        }

        console.log("calc", updatedOutput);
        if (kind === SwapType.SwapExactOut) {
            updatedOutput.reverse()
        }
        return updatedOutput

    }
    catch (error) {
        console.log("Error @ calcTokenInTokenOut", error);
    }
}