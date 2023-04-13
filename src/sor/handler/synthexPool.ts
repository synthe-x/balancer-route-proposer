import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { Graph, PoolType } from "../../graph/graph";








// export function handleSynthexPool(poolIds: string[], pools: any, amount: string, usdPrice: number, tokenMap: any, kind: SwapType, graph: Graph) {
//     try {
//         for (const poolId of poolIds) {

//             const synthTokens = Object.keys(pools[poolId]["synths"]);

//             for (const tokenIn of synthTokens) {

//                 for (const tokenOut of synthTokens) {

//                     if (tokenIn === tokenOut) {
//                         continue;
//                     }

//                     const burnFee = Big(pools[poolId]["synths"][tokenIn]["burnFee"]).div(1e4).toNumber();
//                     const mintFee = Big(pools[poolId]["synths"][tokenOut]["mintFee"]).div(1e4).toNumber();
//                     const tokenInPriceUSD = pools[poolId]["synths"][tokenIn]["priceUSD"];
//                     const tokenOutPriceUSD = pools[poolId]["synths"][tokenOut]["priceUSD"];

//                     if (!tokenMap[tokenIn]) {
//                         tokenMap[tokenIn] = [pools[poolId]["synths"][tokenIn]["symbol"], tokenInPriceUSD, 18];
//                     }

//                     let slipageUSD = Big(amount).times(usdPrice).times(burnFee)
//                         .plus(Big(amount).times(usdPrice).times(mintFee)).toNumber();

//                     let amountIn = Big(amount).times(usdPrice)
//                         .times(1e18).div(tokenInPriceUSD).toFixed(0);

//                     let amountOut = Big(Big(amount).times(usdPrice).minus(slipageUSD))
//                         .times(1e18).div(tokenOutPriceUSD).toFixed(0);

//                     graph.addVertex(tokenIn);

//                     if (kind === SwapType.SwapExactOut) {

//                         amountIn = Big(Big(amount).times(usdPrice).plus(slipageUSD))
//                             .times(1e18).div(tokenInPriceUSD).toFixed(0);

//                         amountOut = Big(amount).times(usdPrice)
//                             .times(1e18).div(tokenOutPriceUSD).toFixed(0);

//                     }
//                     graph.addEdge(tokenIn, tokenOut, slipageUSD, poolId, amountIn, amountOut, PoolType.Synthex ,[], "0")
//                 }
//             }
//         }
//         return tokenMap;
//     }
//     catch (error) {
//         console.log("Error @ handleSynthexPool", error);
//     }
// }

export function handleSynthexPool(poolIds: string[], pools: any, amount: string, usdPrice: number, tokenMap: any, kind: SwapType, graph: Graph) {
    try {
        for (const poolId of poolIds) {

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

                    let slipageUSD = Big(amount).times(usdPrice).times(burnFee)
                        .plus(Big(amount).times(usdPrice).times(mintFee)).toNumber();

                    let amountIn = Big(amount).times(usdPrice)
                        .times(1e18).div(tokenInPriceUSD).toFixed(0);

                    let amountOut = Big(Big(amount).times(usdPrice).minus(slipageUSD))
                        .times(1e18).div(tokenOutPriceUSD).toFixed(0);

                    graph.addVertex(tokenIn);

                    if (kind === SwapType.SwapExactOut) {

                        amountIn = Big(Big(amount).times(usdPrice).plus(slipageUSD))
                            .times(1e18).div(tokenInPriceUSD).toFixed(0);

                        amountOut = Big(amount).times(usdPrice)
                            .times(1e18).div(tokenOutPriceUSD).toFixed(0);

                    }
                    graph.addEdge(tokenIn, tokenOut, slipageUSD, poolId, amountIn, amountOut, PoolType.Synthex ,[], "0")
                }
            }
        }
        return tokenMap;
    }
    catch (error) {
        console.log("Error @ handleSynthexPool", error);
    }
}