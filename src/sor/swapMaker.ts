import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { routeProposer } from "./routeProposer";
import { Response } from "express";
import { ERROR } from "../error";



// swapMaker("100", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 0);
// export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType) {
//     try {

//         let proposeRoute = await routeProposer(amount, t1, t2, kind);


//         // let tokensDetails = proposeRoute.tokensDetails;

//         console.log("route", proposeRoute.swapInput)
//         console.log("assets", proposeRoute.assets)
//         let swaps = [];
//         let synthex = [];
//         let j = 0;
//         for (let swapEle of proposeRoute.swapInput) {

//             if (swapEle.isBalancerPool) {   // change as per isBalancerPoll condition 
//                 // let assets: string[] = []
//                 // let assetMap: any = {};
//                 // let index = 0;
//                 // let swap = []
//                 // const token = swapArr[swapArr.length - 1];
//                 swapEle.swap.pop()
//                 for (let i in swapEle.swap) {

//                     // if (assetMap[proposeRoute.assets[j][swapEle.swap[i].assetInIndex]] === undefined) {
//                     //     assetMap[proposeRoute.assets[j][swapEle.swap[i].assetInIndex]] = index;
//                     //     index++;
//                     //     assets.push(proposeRoute.assets[j][swapEle.swap[i].assetInIndex]);
//                     // }
//                     // if (assetMap[proposeRoute.assets[j][swapEle.swap[i].assetOutIndex]] === undefined) {
//                     //     assetMap[proposeRoute.assets[j][swapEle.swap[i].assetOutIndex]] = index;
//                     //     index++;
//                     //     assets.push(proposeRoute.assets[j][swapEle.swap[i].assetOutIndex]);
//                     // }

//                     // swapEle.swap[i]["assetInIndex"] = assetMap[proposeRoute.assets[j][swapEle[i].assetInIndex]];
//                     // swapEle.swap[i]["assetOutIndex"] = assetMap[proposeRoute.assets[j][swapEle[i].assetOutIndex]];
//                     swap.push(swapEle);

//                 }

//                 // if(kind === SwapType.SwapExactOut) {
//                 //    [ swapInput[0].amount,swapInput[swapInput.length- 1].amount ]=
//                 //    [ swapInput[swapInput.length- 1].amount, swapInput[0].amount, ]
//                 //    swapInput.reverse()
//                 // }


//                 swaps.push({ swap, assets, });
//             }

//             else {

//                 swaps.push({ swap: swapEle, assets: proposeRoute.assets[j] });
//             }
//             j++;
//         }
//         console.log(swaps)
//         // console.log({swap, slipage: slipage.toString()})

//         return { swaps }
//     }
//     catch (error: any) {
//         console.log(`Error @ swapMaker`, error)
//     }
// }
export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType, slipage: number, sender: string, recipient: string, deadline: number) {
    try {

        let proposeRoute = await routeProposer(amount, t1, t2, kind, slipage, sender, recipient, deadline);

        if (typeof proposeRoute == "object" && "status" in proposeRoute) {
            return proposeRoute
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

        console.log(proposeRoute.swapInput)
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



