import { ethers } from "ethers";


export const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc")

export const balancerPoolBySynthex = [
    // {
    //     id: '0x32df62dc3aed2cd6224193052ce665dc18165841000200000000000000000USDC_cUSD_fUSD',
    //     poolType: 'Weighted',
    //     totalLiquidity: '1000000000',
    //     slipage: 0.2,
    //     swapFee: "0.0025",
    //     amp: null,
    //     tokens: [
    //         {   
    //             address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    //             weight: "0.333333333333333333",
    //             balance: "200000000000000000",
    //             symbol: 'USDC',
    //             decimals: 6,
    //             token: {
    //                 latestUSDPrice: '1',
    //                 latestFXPrice: null
    //             }
    //         },
    //         {
    //             address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
    //             symbol: 'cUSD',
    //             decimals: 18,
    //             weight: "0.333333333333333333",
    //             balance: "200000000000000000",
    //             token: {
    //                 latestUSDPrice: '1',
    //             }
    //         },
    //         {
    //             address: '0x50e73618a59a317ae51cb704d7bb078900dcb6b4',
    //             symbol: 'fUSD',
    //             decimals: 18,
    //             weight: "0.333333333333333333",
    //             balance: "200000000000000000",
    //             token: {
    //                 latestUSDPrice: '1',
    //             }
    //         }
    //     ]
    // },
    {
        id: '0x19ff30f9b2d32bfb0f21f2db6c6a3a8604eb8c2b00000000000000000000041c',
        poolType: 'Stable',
        swapFee: "0.0025",
        amp: 100,
        tokens: [
            {
                weight: "0.5",
                address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
                balance: "110",
                symbol: 'WETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1907',
                }
            },
            {
                weight: "0.5",
                address: '0xa28d78534d18324da06fc487041b1ab4a16d557d',
                balance: "110",
                symbol: 'cETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1907',
                  
                }
            }
        ]
    }
];







// export const synthexPools = [
//     {

//         id: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
//         name: 'Crypto Market',
//         address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
//         poolType: 'Weighted',
//         poolTypeVersion: 3,
//         totalLiquidity: '100000000000',
//         tokens: [
//             {
//                 address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
//                 symbol: 'cUSD',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '1',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0xe43a1234ed7715fcf8410ca8bd5aea3b720771fa',
//                 symbol: 'cETH',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '1900',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x5841360012d9d7ad0ddc15e9ff65a734a9bbac62',
//                 symbol: 'cBTC',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '28000',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x80703c6120cbc5fdc9d1971dbc43e06d1d0be0d7',
//                 symbol: 'cLINK',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '7',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x586f0cd6529d29304b1bc779556ae772ea32fea1',
//                 symbol: 'cBNB',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '300',
//                     latestFXPrice: null
//                 }
//             },

//         ]
//     },
//     {

//         id: '0x0113e1920540fa9547389d02e7e79f60b4d4f503',
//         name: 'Foreign Exchange',
//         address: '0x0113e1920540fa9547389d02e7e79f60b4d4f503',
//         poolType: 'Weighted',
//         poolTypeVersion: 3,
//         totalLiquidity: '100000000000',
//         tokens: [
//             {
//                 address: '0x50e73618a59a317ae51cb704d7bb078900dcb6b4',
//                 symbol: 'fUSD',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '1',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x4ae1c78cc903d93eae767cad2603d44437a1c34e',
//                 symbol: 'fSGD',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '0.75',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x6bc3457948e0eebe99b2423f00dcad779260ef91',
//                 symbol: 'fGBP',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '1.22',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0x5f3b1bf1f8c67c3a6336a542232a2525ec3770c6',
//                 symbol: 'fJPY',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '0.0094',
//                     latestFXPrice: null
//                 }
//             },
//             {
//                 address: '0xefb005eca8c9c606a7b7566ee80d6ae463abd792',
//                 symbol: 'fEUR',
//                 decimals: 18,
//                 token: {
//                     latestUSDPrice: '0.85',
//                     latestFXPrice: null
//                 }
//             },

//         ]
//     }
// ]