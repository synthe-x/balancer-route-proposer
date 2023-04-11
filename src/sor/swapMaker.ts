import { SwapType } from "@balancer-labs/sdk";
import { routeProposer } from ".";
import { querySwap } from "./querySwap";



swapMaker("100", "0x6694340fc020c5E6B96567843da2df01b2CE1eb6", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 0);
export async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType) {
    try {

        let proposeRoute = await routeProposer(amount, t1, t2, kind);
        console.log(proposeRoute.swapInput)
        console.log(proposeRoute.assets)
    
        let tokensDetails = proposeRoute.tokensDetails;
        let swap = [];
        let synthex = [];
        let j = 0;
        for (let swapArr of proposeRoute.swapInput) {

            if (swapArr[0].poolId.length > 42) {
                let assetInput: string[] = []
                let assetMap: any = {};
                let index = 0;
                let swapInput = []
                for (let i in swapArr) {

                    if (!assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]]) {
                        assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[j][swapArr[i].assetInIndex]);
                    }
                    if (!assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]]) {
                        assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[j][swapArr[i].assetOutIndex]);
                    }

                    swapArr[i]["assetInIndex"] = assetMap[proposeRoute.assets[j][swapArr[i].assetInIndex]];
                    swapArr[i]["assetOutIndex"] = assetMap[proposeRoute.assets[j][swapArr[i].assetOutIndex]];
                    swapInput.push(swapArr[i]);

                    // if(+i === swapArr.length - 1){
                    //     swap.push({swapInput, assetInput});
                    //     // await do swap
                    //     await querySwap(swapInput, assetInput)
                    //     swapInput = [];
                    //     assetInput = [];
                    // }
                }

                // await do swap
                let res = await querySwap(swapInput, assetInput, tokensDetails[j]);

                swap.push({ swapInput, assetInput, res });
                // swapInput = [];
                // assetInput = [];
            }

            else {
                console.log("Going in synthex Pool")
            }
            j++;
        }

        console.log(swap)

        // console.log(swap)
        // console.log(swap[0].swapInput)


    }
    catch (error: any) {
        console.log(`Error @ swapMaker`, error)
    }
}



