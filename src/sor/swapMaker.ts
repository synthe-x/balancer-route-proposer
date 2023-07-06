import { SwapType } from "@balancer-labs/sdk";
import { routeProposer } from "./routeProposer";
import { MANTLE_TOKEN_ADDRESS, ZERO_ADDRESS } from "./constant";
import { FEData } from "./helper/FEData";
import { ISwapData, ITokenMap } from "../utils/types";
import Big from "big.js";
import { updateLimits } from "./helper/updateLimits";




export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType, slipage: number, sender: string, recipient: string, deadline: number) {
    try {

        let proposeRoute = await routeProposer({ amount, t1, t2, kind, slipage, sender, recipient, deadline });

        if (typeof proposeRoute == "object" && "status" in proposeRoute) {
            return proposeRoute
        }

        if (proposeRoute.isEth) {
            proposeRoute.assets[0][0] = ZERO_ADDRESS;
        }

        //updating proposeRoute.swapInput
        updateLimits(proposeRoute, kind);

        const fData = FEData(proposeRoute.swapInput, kind, slipage, proposeRoute.tokenMap);

        if (kind === SwapType.SwapExactOut) {
            // re routing as GivenIn.
            if(t1 === ZERO_ADDRESS) t1 = MANTLE_TOKEN_ADDRESS;
            const amount = Big(fData.maxIn).div(10 ** proposeRoute.tokenMap[t1][2]).toString();
           
            proposeRoute = await routeProposer(
                { amount, t1, t2, kind: SwapType.SwapExactIn, slipage, sender, recipient, deadline }
                );

            if (typeof proposeRoute == "object" && "status" in proposeRoute) {
                return proposeRoute
            }

            if (proposeRoute.isEth) {
                proposeRoute.assets[0][0] = ZERO_ADDRESS;
            }
            updateLimits(proposeRoute, kind);
            kind = SwapType.SwapExactIn;
        }

        const data = {
            kind,
            swaps: proposeRoute.swapInput,
            deadline,
            funds: {
                sender: sender,
                recipient: recipient,
                fromInternalBalance: false,
                toInternalBalance: false
            },
            fData
        }

        return data
    }
    catch (error: any) {
        console.log(`Error @ swapMaker`, error)
    }
}




