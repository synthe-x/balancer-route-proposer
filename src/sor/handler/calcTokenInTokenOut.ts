import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { BigNumberish, fp } from "../../math/numbers";
import { stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../math/stablePool";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../math/wieghtedPool";
import { IError, ISwapData, ITokenMap, PoolType } from "../../types";
import { ERROR } from "../../error";





export function calcTokenInTokenOut(output: any, kind: SwapType, tokenMap: ITokenMap, slipage: number) :
(ISwapData[][]| IError)
{
    try {
        const updatedOutput: any = [];
        if (kind === SwapType.SwapExactOut) {
            output.reverse();
        }

        for (let pools of output) {

            if (pools[0].poolType !== PoolType.Synthex) {

                if (updatedOutput.length > 0) {
                    const l = updatedOutput.length - 1;
                    const lastArr = updatedOutput[l].swap;

                    if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                    }
                    else if (kind === SwapType.SwapExactOut) {
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    }
                }

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;
                    // let price = {
                    //     tokenIn: tokenMap[pools[0]['assets']['assetIn']][1],
                    //     tokenOut: tokenMap[pools[pools.length - 1]['assets']['assetOut']][1]
                    // };
                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {
                            const amount = fp(Big(amountOut).minus(Big(amountOut).times(pools[i].swapFee)).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;

                            amountOut = Big(stablePoolcalcOutGivenIn(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish]).toString())
                                .div(1e18).times(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(0);

                            pools[i]["amount"] = "0";
                            // price = {
                            //     tokenIn: tokenMap[pools[0]['assets']['assetIn']][1],
                            //     tokenOut: tokenMap[pools[pools.length - 1]['assets']['assetOut']][1]
                            // }
                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                        }
                        else if (pools[i].poolType === PoolType.Weighted) {

                            const amount = amountOut;

                            pools[i].parameters[0] = amount;

                            amountOut = Big(weightedPoolTokenInForTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsOut"]).toFixed(0)

                            pools[i]["amount"] = "0";


                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                        }

                        if (+i === pools.length - 1) {
                            pools[0]["amount"] = amountIn;
                        }
                    }

                    // const fee = {
                    //     burnFee: "0",
                    //     mintFee: "0"
                    // }

                    pools.push({ amountIn, amountOut });
                    // updatedOutput.push({ swap: pools, price, fee, isBalancerPool: true });
                    const limits = [+amountIn, -amountOut * (1 - slipage / 100)];
                    updatedOutput.push({ swap: pools, isBalancerPool: true, limits: limits });
                }

                else if (kind === SwapType.SwapExactOut) {

                    pools.reverse();
                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;
                    // let price = {
                    //     tokenIn: tokenMap[pools[0]['assets']['assetIn']][1],
                    //     tokenOut: tokenMap[pools[pools.length - 1]['assets']['assetOut']][1]
                    // };
                    for (let i in pools) {

                        if (pools[i].poolType === PoolType.Stable) {

                            //amountOut
                            const amount = fp(Big(amountIn).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(18));

                            pools[i].parameters[4] = amount;

                            amountIn = Big(stablePoolcalcInGivenOut(...pools[i].parameters as [BigNumberish[], BigNumberish, number, number, BigNumberish]).toString())
                                .div(1e18).times(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(0);

                            amountIn = Big(amountIn).plus(Big(amountIn).times(pools[i].swapFee)).toFixed(0);

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                        }
                        else if (pools[i].poolType === PoolType.Weighted) {
                            const amount = amountIn;

                            pools[i].parameters[0] = amount

                            amountIn = Big(weightedPoolTokenInForExactTokenOut(...pools[i].parameters as [string, any]).toString()).times(10 ** pools[i].parameters[1]["decimalsIn"]).toFixed(0)

                            pools[i]["amount"] = "0";

                            const deleteKeysOfPool = ["swapFee", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                            deleteKeysOfPool.forEach((x: string) => {
                                delete pools[i][x];
                            })
                        }

                        if (+i === pools.length - 1) {
                            pools[0]["amount"] = amountOut;
                        }
                    }

                    // const fee = {
                    //     burnFee: "0",
                    //     mintFee: "0"
                    // }
                    pools.push({ amountIn, amountOut });
                    // updatedOutput.push({ swap: pools, price, fee, isBalancerPool: true });
                    const limits = [+amountIn * (1 + slipage / 100), -amountOut];
                    updatedOutput.push({ swap: pools, isBalancerPool: true, limits: limits });
                }
            }
            else if (pools[0].poolType === PoolType.Synthex) {

                if (updatedOutput.length > 0) {

                    const l = updatedOutput.length - 1;

                    const lastArr = updatedOutput[l].swap;

                    if (kind === SwapType.SwapExactIn) {
                        pools[0].amountIn = lastArr[lastArr.length - 1]["amountOut"];
                    }
                    else if (kind === SwapType.SwapExactOut) {
                        pools[0].amountOut = lastArr[lastArr.length - 1]["amountIn"];
                    } 
                }

                if (kind === SwapType.SwapExactIn) {

                    let amountIn: string = pools[0].amountIn;
                    let amountOut: string = pools[0].amountIn;
                    // let price;
                    // let fee;
                    for (let i in pools) {
                        const amountUSD = Big(amountOut).times(tokenMap[pools[i]['assets']['assetIn']][1]).div(10 ** tokenMap[pools[i]['assets']['assetIn']][2]).toFixed(18);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountOut = Big(Big(amountUSD).minus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetOut']][1]).times(1e18).toFixed(0);

                        pools[i]["amount"] = amountIn;

                        // price = {
                        //     tokenIn: tokenMap[pools[0]['assets']['assetIn']][1],
                        //     tokenOut: tokenMap[pools[0]['assets']['assetOut']][1]
                        // };
                        // fee = {
                        //     burnFee: pools[0].parameters.burnFee,
                        //     mintFee: pools[0].parameters.mintFee
                        // }
                        const deleteKeysOfPool = ["slipage", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                        deleteKeysOfPool.forEach((x: string) => {
                            delete pools[i][x];
                        })
                    }
                    pools.push({ amountIn, amountOut });

                    const limits = [+amountIn, -amountOut * (1 - slipage / 100)];
                    updatedOutput.push({ swap: pools, isBalancerPool: false, limits: limits });
                }
                else if (kind === SwapType.SwapExactOut) {
                    let amountIn: string = pools[0].amountOut;
                    let amountOut: string = pools[0].amountOut;
                    // let price;
                    // let fee;
                    for (let i in pools) {

                        const amountUSD = Big(amountIn).times(tokenMap[pools[i]['assets']['assetOut']][1]).div(10 ** tokenMap[pools[i]['assets']['assetOut']][2]).toFixed(0);

                        const slipageUSD = Big(amountUSD).times(pools[i].parameters.burnFee).plus(Big(amountUSD).times((pools[i].parameters.mintFee))).toFixed(18);

                        amountIn = Big(Big(amountUSD).plus(slipageUSD)).div(tokenMap[pools[i]['assets']['assetIn']][1]).times(1e18).toFixed(0);

                        pools[i]["amount"] = amountOut;

                        // price = {
                        //     tokenIn: tokenMap[pools[0]['assets']['assetIn']][1],
                        //     tokenOut: tokenMap[pools[0]['assets']['assetOut']][1]
                        // };
                        // fee = {
                        //     burnFee: pools[0].parameters.burnFee,
                        //     mintFee: pools[0].parameters.mintFee
                        // }
                        const deleteKeysOfPool = ["slipage", "amountIn", "amountOut", "parameters", "assets", "poolType"];

                        deleteKeysOfPool.forEach((x: string) => {
                            delete pools[i][x];
                        })
                    }

                    pools.push({ amountIn, amountOut });
                    const limits = [+amountIn * (1 + slipage / 100), -amountOut];
                    updatedOutput.push({ swap: pools, isBalancerPool: false, limits: limits });
                }
            }
        }

        // console.log("calc", updatedOutput);
        if (kind === SwapType.SwapExactOut) {
            updatedOutput.reverse()
        }
        return updatedOutput as ISwapData[][]

    }
    catch (error) {
        console.log("Error @ calcTokenInTokenOut", error);
        return {status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500}
    }
}

