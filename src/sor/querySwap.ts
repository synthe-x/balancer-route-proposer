// import { SwapType } from "@balancer-labs/sdk";
// import Big from "big.js";
// import { ethers } from "ethers"
// import { getABI } from "../helper/getAbi";



// querySwap(
//     [
//         {
//             "poolId": "0x186423bfe65426534814ad90ff6fad85e8523fe2000000000000000000000001",
//             "assetInIndex": "0",
//             "assetOutIndex": "1",
//             "userData": "0x",
//             "amount": "39097500000000000000"
//         }
//     ],
//     [
//         "0x0134369386a3aebcf0704946c0df89fe78fa2b50",
//         "0x1561ccba861ee39552da5d703b629b1b23ee1899"
//     ], 
//     [],
//     1
//     )
// export async function querySwap(swap: any, tokens: string[], tokensDetails: any, kind: SwapType) {
//     try {
//         console.log(
//             swap,
//             tokens, tokensDetails, kind)
//         const provider = new ethers.providers.JsonRpcProvider("https://rpc.testnet.mantle.xyz")

//         let vault = new ethers.Contract("0xc08e0bC5981622E3f70b8406ff9F19BbcEDa5bF1", await getABI("Vault"), provider);
//         const owner = new ethers.Wallet("7cf03fae45cb10d4e3ba00a10deeacfc8cea1be0eebcfb7277a7df2e5074a405", provider);
//         let queryBatchSwap = await vault.connect(owner).callStatic.queryBatchSwap(
//             kind,
//             swap,
//             tokens,
//             {
//                 sender: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
//                 fromInternalBalance: false,
//                 recipient: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
//                 toInternalBalance: false
//             }
//         )

        
//         queryBatchSwap = queryBatchSwap.map((x: any) => Number(x));
//         console.log(queryBatchSwap)

//         // queryBatchSwap = queryBatchSwap.sort((a: number, b: number) => a - b);

//         // let tokenInUSD = Big(queryBatchSwap[queryBatchSwap.length - 1]).times(tokensDetails.priceInUSD).div(10 ** tokensDetails.decimalsIn).toNumber();

//         // let tokenOutUSD = Big(Math.abs(queryBatchSwap[0])).times(tokensDetails.priceOutUSD).div(10 ** tokensDetails.decimalsOut).toNumber();

//         // let slipage = Big(tokenInUSD).minus(tokenOutUSD).toNumber()

//         // let percSlipage = Big(slipage).div(tokenInUSD).toNumber();

//         // if(kind === SwapType.SwapExactOut) {
//         //     slipage =  Big(tokenInUSD).minus(Math.abs(tokenOutUSD)).toNumber()
//         // }

//         // console.log(queryBatchSwap)
//         // console.log(tokenInUSD);
//         // console.log(tokenOutUSD);
//         // return { slipage, percSlipage};
//     }
//     catch (error) {
//         console.log(`Error @ querySwap`, error)
//     }
// }