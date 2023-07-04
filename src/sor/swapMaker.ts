import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { routeProposer } from "./routeProposer";
import { Response } from "express";
import { ERROR } from "../utils/error";
import { ISwapData } from "../utils/types";
import { ZERO_ADDRESS } from "./constant";




export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType, slipage: number, sender: string, recipient: string, deadline: number) {
    try {

        let proposeRoute = await routeProposer({ amount, t1, t2, kind, slipage, sender, recipient, deadline });

        if (typeof proposeRoute == "object" && "status" in proposeRoute) {
            return proposeRoute
        }

        if (proposeRoute.isEth) {
            proposeRoute.assets[0][0] = ZERO_ADDRESS;
        }

        proposeRoute.swapInput.forEach((swapEle: any, index: number) => {
            if ('assets' in proposeRoute) {
                swapEle.swap.pop();

                swapEle.assets = proposeRoute.assets[index];
            }
            const newLimits = Array(swapEle.assets.length).fill(0);
            swapEle.swap.forEach((swap: any, index: number) => {

                if (kind === SwapType.SwapExactIn) {

                    if (index === 0) {
                        newLimits[swap.assetInIndex] = swapEle.limits[0];
                    }
                    else {
                        newLimits[swap.assetInIndex] = 0;
                    }
                    if (index === swapEle.swap.length - 1) {
                        newLimits[swap.assetOutIndex] = swapEle.limits[1];
                    }
                }
                else if (kind === SwapType.SwapExactOut) {

                    if (index === 0) {
                        newLimits[swap.assetOutIndex] = swapEle.limits[1];
                    }
                    else {
                        newLimits[swap.assetInIndex] = 0;
                    }
                    if (index === swapEle.swap.length - 1) {
                        newLimits[swap.assetInIndex] = swapEle.limits[0];
                    }
                }

            });

            swapEle.limits = newLimits;

        });

        const data = {
            kind: SwapType.SwapExactIn,
            swaps: proposeRoute.swapInput,
            deadline: deadline,
            funds: {
                sender: sender,
                recipient: recipient,
                fromInternalBalance: false,
                toInternalBalance: false
            }
        }

        return data
    }
    catch (error: any) {
        console.log(`Error @ swapMaker`, error)
    }
}



