import { ethers } from "ethers"
import { getABI } from "../helper/getAbi";


// querySwap()
export async function querySwap(swap: any, tokens: string[]) {
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

        console.log("querySwap",queryBatchSwap.map((x:any)=> x.toString()));
    }
    catch (error) {
        console.log(`Error @ querySwap`, error)
    }
}