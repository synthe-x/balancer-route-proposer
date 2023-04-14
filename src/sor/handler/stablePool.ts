import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { Graph, PoolType } from "../../graph/graph";
import { BigNumberish, fp } from "../../math/numbers";
import {  stablePoolcalcInGivenOut, stablePoolcalcOutGivenIn } from "../../math/stablePool1";






export function handleStablePool(currPool: any, currPooltokens: any, kind: SwapType, amount: string, usdPrice: number, tokenMap: any, tokenIn: any, tokenOut: any, graph: Graph) {
    try {

        const poolId = currPool.id;
        let tokens: string[] = [];
        let allBalances: any[] = [];

        for (const currToken of currPooltokens) {
            tokens.push(currToken.address);
            allBalances.push(fp(currToken.balance));
        }

        if (kind === SwapType.SwapExactIn) {

            let amountIn = Big(amount).times(usdPrice)
                .div(tokenMap[tokenIn.address][1])
                .toFixed(18);

            let amountInAfterFee = fp(Big(amountIn).minus(Big(amountIn).times(currPool.swapFee)).toFixed(18))
            let parameters: [BigNumberish[], BigNumberish, number, number, BigNumberish] = [allBalances, (currPool.amp), tokens.indexOf(tokenIn.address), tokens.indexOf(tokenOut.address), amountInAfterFee]

            let tokenOutAmount = Big(stablePoolcalcOutGivenIn(...parameters).toString()).div(1e18).toFixed(18);
            console.log("TOKENOUT+++=", tokenOutAmount.toString())
            let expectedAmountUSD = Big(amountIn).times(tokenMap[tokenIn.address][1]).toFixed(18);

            let actualAmountUSD = Big(tokenOutAmount.toString()).times(tokenMap[tokenOut.address][1]).toFixed(18);

            let slipageUSD = Big(expectedAmountUSD).minus(actualAmountUSD).toNumber();

            const amountInTokenDecimal = Big(amountIn).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal = Big(tokenOutAmount).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);
            // console.log(tokenIn.address)
            // console.log(tokenOut.address)
            // console.log(poolId)
            // console.log("Slipage", slipage)
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;
            // console.log(amountInTokenDecimal, amountOutTokenDecimal);
            graph.addVertex(tokenIn.address);

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Stable, parameters, currPool.swapFee);

        }

        if (kind === SwapType.SwapExactOut) {

            const amountOut = Big(amount).times(usdPrice)
                .div(tokenMap[tokenOut.address][1])
                .toFixed(18);

            let parameters: [BigNumberish[], BigNumberish, number, number, BigNumberish] = [allBalances, (currPool.amp), tokens.indexOf(tokenIn.address), tokens.indexOf(tokenOut.address), fp(amountOut)]

            let amountIn = Big(stablePoolcalcInGivenOut(...parameters).toString()).div(1e18).toFixed(18);
            console.log("TOKENOUT+++=", amountIn.toString())
            const expectedAmountUSD = Big(amountOut).times(tokenMap[tokenOut.address][1]).toFixed(18);

            const amountInAfterFee = Big(amountIn).plus(Big(amountIn).times(currPool.swapFee)).toFixed(18);

            const actualAmountUSD = Big(amountInAfterFee).times(tokenMap[tokenIn.address][1]).toFixed(18);

            let slipageUSD = Big(actualAmountUSD).minus(expectedAmountUSD).toNumber();

            const amountInTokenDecimal = Big(amountInAfterFee).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal = Big(amountOut).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);
            // console.log(tokenIn.address)
            // console.log(tokenOut.address)
            // console.log(poolId)
            // console.log("Slipage", slipage)
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            graph.addVertex(tokenIn.address);

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Stable, parameters, currPool.swapFee);

        }


    }
    catch (error) {
        console.log("Error @ handleStablePool", error)
    }
}