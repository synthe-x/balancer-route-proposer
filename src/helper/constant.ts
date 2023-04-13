import { ethers } from "ethers";


export const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc")
export type TokenMap = { [key: string]: [string, string, number] };
export const balancerPoolBySynthex = [
    {
        id: '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003bc',
        name: 'USDC-fUSD-cUSD',
        address: '0x32df62dc3aed2cd6224193052ce665dc18165942',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '1000000000',
        slipage: 0.2,
        tokens: [
            {
                address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
                symbol: 'USDC',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
                symbol: 'cUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x50e73618a59a317ae51cb704d7bb078900dcb6b4',
                symbol: 'fUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            }
        ]
    },
    {
        id: '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003wu',
        name: 'wstETH-USDC',
        address: '0x32df62dc3aed2cd6224193052ce665dc18165565',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '10000000000',
        slipage: 0.5,
        tokens: [
            {
                address: '0x5979d7b546e38e414f7e9822514be443a4800529',
                symbol: 'wstETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '2100',
                    latestFXPrice: null
                }
            },
            {
                address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
                symbol: 'USDC',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            }
        ]
    },
    {
        id: '0x32df62dc3aed2cd6224193052ce665dc181658410002000000000000000003ef',
        name: 'WETH-cETH',
        address: '0x32df62dc3aed2cd6224193052ce665dc18165545',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '10000000000',
        slipage: 0.2,
        tokens: [
            {
                address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
                symbol: 'WETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1900',
                    latestFXPrice: null
                }
            },
            {
                address: '0xe43a1234ed7715fcf8410ca8bd5aea3b720771fa',
                symbol: 'cETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1900',
                    latestFXPrice: null
                }
            }
        ]
    }
];




export const synthexPools = [
    {

        id: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
        name: 'Crypto Market',
        address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '100000000000',
        tokens: [
            {
                address: '0x30ebd10f4df5e3f9de8bad8ab13207c23f1cbc7f',
                symbol: 'cUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0xe43a1234ed7715fcf8410ca8bd5aea3b720771fa',
                symbol: 'cETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1900',
                    latestFXPrice: null
                }
            },
            {
                address: '0x5841360012d9d7ad0ddc15e9ff65a734a9bbac62',
                symbol: 'cBTC',
                decimals: 18,
                token: {
                    latestUSDPrice: '28000',
                    latestFXPrice: null
                }
            },
            {
                address: '0x80703c6120cbc5fdc9d1971dbc43e06d1d0be0d7',
                symbol: 'cLINK',
                decimals: 18,
                token: {
                    latestUSDPrice: '7',
                    latestFXPrice: null
                }
            },
            {
                address: '0x586f0cd6529d29304b1bc779556ae772ea32fea1',
                symbol: 'cBNB',
                decimals: 18,
                token: {
                    latestUSDPrice: '300',
                    latestFXPrice: null
                }
            },

        ]
    },
    {

        id: '0x0113e1920540fa9547389d02e7e79f60b4d4f503',
        name: 'Foreign Exchange',
        address: '0x0113e1920540fa9547389d02e7e79f60b4d4f503',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '100000000000',
        tokens: [
            {
                address: '0x50e73618a59a317ae51cb704d7bb078900dcb6b4',
                symbol: 'fUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x4ae1c78cc903d93eae767cad2603d44437a1c34e',
                symbol: 'fSGD',
                decimals: 18,
                token: {
                    latestUSDPrice: '0.75',
                    latestFXPrice: null
                }
            },
            {
                address: '0x6bc3457948e0eebe99b2423f00dcad779260ef91',
                symbol: 'fGBP',
                decimals: 18,
                token: {
                    latestUSDPrice: '1.22',
                    latestFXPrice: null
                }
            },
            {
                address: '0x5f3b1bf1f8c67c3a6336a542232a2525ec3770c6',
                symbol: 'fJPY',
                decimals: 18,
                token: {
                    latestUSDPrice: '0.0094',
                    latestFXPrice: null
                }
            },
            {
                address: '0xefb005eca8c9c606a7b7566ee80d6ae463abd792',
                symbol: 'fEUR',
                decimals: 18,
                token: {
                    latestUSDPrice: '0.85',
                    latestFXPrice: null
                }
            },

        ]
    }
]