import { ethers } from "ethers";


export const provider = new ethers.providers.JsonRpcProvider("https://nd-389-970-162.p2pify.com/17b0fbe8312c9ff963057d537b9c7864")
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
                address: '0x317b23dc91ad1d00658548134a84e58dac538972',
                symbol: 'cUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x863c90913db6674099ddcd95f535037e5f4d5710',
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
                address: '0x2f1654f45325e6115e5e2197f3d34c9151a484ab',
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

        id: '0x0bf7e7fb631457bbc0e3a3abc94a50364d9f11e1',
        name: 'Crypto Market',
        address: '0x0bf7e7fb631457bbc0e3a3abc94a50364d9f11e1',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '100000000000',
        tokens: [
            {
                address: '0x317b23dc91ad1d00658548134a84e58dac538972',
                symbol: 'cUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x2f1654f45325e6115e5e2197f3d34c9151a484ab',
                symbol: 'cETH',
                decimals: 18,
                token: {
                    latestUSDPrice: '1900',
                    latestFXPrice: null
                }
            },
            {
                address: '0x59470445a7c0667c39838e4fcfb8a23a3b58687f',
                symbol: 'cBTC',
                decimals: 18,
                token: {
                    latestUSDPrice: '28000',
                    latestFXPrice: null
                }
            },
            {
                address: '0xdd206e7f12f2c15f935b8548d4c6c9e1235bb9c0',
                symbol: 'cLINK',
                decimals: 18,
                token: {
                    latestUSDPrice: '7',
                    latestFXPrice: null
                }
            },
            {
                address: '0x8186ae4492b7122c2f61f8eba306fba541a9271d',
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

        id: '0xc859343104ac0aff202ddec654d76885a44664b9',
        name: 'Foreign Exchange',
        address: '0xc859343104ac0aff202ddec654d76885a44664b9',
        poolType: 'Weighted',
        poolTypeVersion: 3,
        totalLiquidity: '100000000000',
        tokens: [
            {
                address: '0x863c90913db6674099ddcd95f535037e5f4d5710',
                symbol: 'fUSD',
                decimals: 18,
                token: {
                    latestUSDPrice: '1',
                    latestFXPrice: null
                }
            },
            {
                address: '0x129e4fb310b50ef8787a3f43011145d0509f0463',
                symbol: 'fSGD',
                decimals: 18,
                token: {
                    latestUSDPrice: '0.75',
                    latestFXPrice: null
                }
            },
            {
                address: '0x233642677783b8796770c25761e92918d0f0b3d6',
                symbol: 'fGBP',
                decimals: 18,
                token: {
                    latestUSDPrice: '1.22',
                    latestFXPrice: null
                }
            },
            {
                address: '0x6038818260487edbbf0e55da8a31c53a35182c80',
                symbol: 'fJPY',
                decimals: 18,
                token: {
                    latestUSDPrice: '0.0094',
                    latestFXPrice: null
                }
            },
            {
                address: '0xcc8fcd494876e6f9e2320f963c943fc0bed3d9d6',
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