import { SwapType } from "@balancer-labs/sdk";
import { routeProposer } from ".";
import { querySwap } from "./querySwap";



swapMaker("1", "0x5979d7b546e38e414f7e9822514be443a4800529", "0x3082CC23568eA640225c2467653dB90e9250AaA0", 0);
async function swapMaker(amount: string, t1: string, t2: string, kind: SwapType) {
    try {

        let proposeRoute = await routeProposer(amount, t1, t2, kind);
        console.log(proposeRoute.swapInput)
        let swap = [];
        let synthex = [];
        for (let ele of proposeRoute.swapInput) {

            if (ele[0].poolId.length > 42) {
                let assetInput: string[] = []
                let assetMap: any = {};
                let index = 0;
                let swapInput = []
                for (let i in ele) {

                    if (!assetMap[proposeRoute.assets[ele[i].assetInIndex]]) {
                        assetMap[proposeRoute.assets[ele[i].assetInIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[ele[i].assetInIndex]);
                    }
                    if (!assetMap[proposeRoute.assets[ele[i].assetOutIndex]]) {
                        assetMap[proposeRoute.assets[ele[i].assetOutIndex]] = index;
                        index++;
                        assetInput.push(proposeRoute.assets[ele[i].assetOutIndex]);
                    }

                    ele[i]["assetInIndex"] = assetMap[proposeRoute.assets[ele[i].assetInIndex]];
                    ele[i]["assetOutIndex"] = assetMap[proposeRoute.assets[ele[i].assetOutIndex]];
                    swapInput.push(ele[i]);

                    if(+i === ele.length - 1){
                        swap.push({swapInput, assetInput});
                        // await do swap
                        await querySwap(swapInput, assetInput)
                        swapInput = [];
                        assetInput = [];
                    }
                }
            }

            else {
                console.log("Going in synthex Pool")
            }
        }

        // console.log(swap)
        // console.log(swap[0].swapInput)


    }
    catch (error: any) {
        console.log(`Error @ swapMaker`, error)
    }
}



