import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { Graph, PoolType } from "../../graph/graph";
import { ethers } from "ethers";




export function handleSynthexPool(poolIds: string[], pools: any, amount: string, usdPrice: number, tokenMap: any, kind: SwapType, graph: Graph) {
    try {
        for (let poolId of poolIds) {

            const synthTokens = Object.keys(pools[poolId]["synths"]);

            for (const tokenIn of synthTokens) {

                for (const tokenOut of synthTokens) {

                    if (tokenIn === tokenOut) {
                        continue;
                    }

                    const burnFee = Big(pools[poolId]["synths"][tokenIn]["burnFee"]).div(1e4).toNumber();
                    const mintFee = Big(pools[poolId]["synths"][tokenOut]["mintFee"]).div(1e4).toNumber();
                    const tokenInPriceUSD = pools[poolId]["synths"][tokenIn]["priceUSD"];
                    const tokenOutPriceUSD = pools[poolId]["synths"][tokenOut]["priceUSD"];

                    if (!tokenMap[tokenIn]) {
                        tokenMap[tokenIn] = [pools[poolId]["synths"][tokenIn]["symbol"], tokenInPriceUSD, 18];
                    }
                    if (!tokenMap[tokenOut]) {
                        tokenMap[tokenOut] = [pools[poolId]["synths"][tokenOut]["symbol"], tokenOutPriceUSD, 18];
                    }

                    let slipageUSD = Big(amount).times(usdPrice).times(burnFee)
                        .plus(Big(amount).times(usdPrice).times(mintFee)).toNumber();

                    let amountIn = Big(amount).times(usdPrice)
                        .times(10 ** tokenMap[tokenIn][2]).div(tokenInPriceUSD).toFixed(0);

                    let amountOut = Big(Big(amount).times(usdPrice).minus(slipageUSD))
                        .times(10 ** tokenMap[tokenOut][2]).div(tokenOutPriceUSD).toFixed(0);

                    graph.addVertex(tokenIn);

                    if (kind === SwapType.SwapExactOut) {

                        amountIn = Big(Big(amount).times(usdPrice).plus(slipageUSD))
                            .times(10 ** tokenMap[tokenIn][2]).div(tokenInPriceUSD).toFixed(0);

                        amountOut = Big(amount).times(usdPrice)
                            .times(10 ** tokenMap[tokenOut][2]).div(tokenOutPriceUSD).toFixed(0);

                    }
                    // console.log("TOKENOUT //////", +amountOut/(10 ** tokenMap[tokenOut][2]),tokenIn, tokenOut, poolId);
                    const parameters = { burnFee, mintFee }

                    let currPoolId = poolId+"000000000000000000000000";

                    graph.addEdge(tokenIn, tokenOut, slipageUSD, currPoolId, amountIn, amountOut, PoolType.Synthex, parameters, "0")
                }
            }
        }
        return tokenMap;
    }
    catch (error) {
        console.log("Error @ handleSynthexPool", error);
    }
}

