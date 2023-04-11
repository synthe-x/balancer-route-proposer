import Big from "big.js";
import { ethers } from "ethers"
import { getABI } from "../helper/getAbi";


// querySwap()
export async function querySwap(swap: any, tokens: string[], tokensDetails: any) {
    try {

        const provider = new ethers.providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc")

        let vault = new ethers.Contract("0xBA12222222228d8Ba445958a75a0704d566BF2C8", await getABI("Vault"), provider);
        const owner = new ethers.Wallet("7cf03fae45cb10d4e3ba00a10deeacfc8cea1be0eebcfb7277a7df2e5074a405", provider);
        let queryBatchSwap = await vault.connect(owner).callStatic.queryBatchSwap(
            0,
            swap,
            tokens,
            {
                sender: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
                fromInternalBalance: false,
                recipient: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
                toInternalBalance: false
            }
        )

        // let limit = queryBatchSwap.map((x: string) => {
        //     if (+x < 0) {
        //         x = (Number(x) * 0.99).toFixed(0)
        //     }
        //     return x
        // })
        // console.log(limit)
        // let batchSwap = await vault.connect(owner).callStatic.batchSwap(
        //     0,
        //     swap,
        //     tokens,
        //     {
        //         sender: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
        //         fromInternalBalance: false,
        //         recipient: "0x103B62f68Da23f20055c572269be67fA7635f2fc",
        //         toInternalBalance: false
        //     },
        //     limit,
        //     1681218703
        // )
        queryBatchSwap = queryBatchSwap.map((x: any) => Number(x));

        queryBatchSwap = queryBatchSwap.sort((a: number, b: number) => a - b);

        let tokenInUSD = Big(queryBatchSwap[queryBatchSwap.length - 1]).times(tokensDetails.priceInUSD).div(10 ** tokensDetails.decimalsIn).toNumber();

        let tokenOutUSD = Big(queryBatchSwap[0]).times(tokensDetails.priceOutUSD).div(10 ** tokensDetails.decimalsOut).toNumber();

        let slipage = Big(tokenInUSD).minus(Math.abs(tokenOutUSD)).toNumber()

        let percSlipage = Big(slipage).div(tokenInUSD).toNumber();



        // console.log(batchSwap, "batchSwap");
        console.log(queryBatchSwap)
        console.log(tokenInUSD);
        console.log(tokenOutUSD);
        return { slipage, percSlipage };
    }
    catch (error) {
        console.log(`Error @ querySwap`, error)
    }
}