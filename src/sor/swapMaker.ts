import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { routeProposer } from ".";
import { querySwap } from "./querySwap";
0x6694340fc020c5E6B96567843da2df01b2CE1eb6

// swapMaker("100", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 0);
export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType) {
    try {

        let proposeRoute = await routeProposer(amount, t1, t2, kind);


        // let tokensDetails = proposeRoute.tokensDetails;
        let swap = [];
        let synthex = [];
        let j = 0;
        let slipage = Big(0);
        for (let swapArr of proposeRoute.swapInput) { 

            if (swapArr[0].poolId.length > 42) {
                let assetInput: string[] = []
                let assetMap: any = {};
                let index = 0;
                let swapInput = []
                const token = swapArr[swapArr.length - 1];
                swapArr.pop()
                for (let i in swapArr) {

                    if (assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]] === undefined) {
                        assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[j][swapArr[i].assetInIndex]);
                    }
                    if (assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]] === undefined) {
                        assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[j][swapArr[i].assetOutIndex]);
                    }

                    swapArr[i]["assetInIndex"] = assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]];
                    swapArr[i]["assetOutIndex"] = assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]];
                    swapInput.push(swapArr[i]);

                }

                // if(kind === SwapType.SwapExactOut) {
                //    [ swapInput[0].amount,swapInput[swapInput.length- 1].amount ]=
                //    [ swapInput[swapInput.length- 1].amount, swapInput[0].amount, ]
                //    swapInput.reverse()
                // }


                // let res = await querySwap(swapInput, assetInput, tokensDetails[j], kind);
                // if(!res){
                //     return console.log("PLEASE_TRY_AGAIN");
                // }
                // slipage = Big(slipage).plus(res.slipage);
                swap.push({ swapInput, assetInput, token });
            }

            else {
                console.log("Going in synthex Pool");

                for (let i in swapArr) {
                    slipage = Big(slipage).plus(swapArr[i].slipage);
                }
                swap.push(swapArr);
            }
            j++;
        }
        console.log(swap[0].swapInput, slipage.toString())
        // console.log({swap, slipage: slipage.toString()})
        return { swap }
    }
    catch (error: any) {
        console.log(`Error @ swapMaker`, error)
    }
}



