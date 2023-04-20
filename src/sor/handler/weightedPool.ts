import { SwapType } from "@balancer-labs/sdk";
import Big from "big.js";
import { Graph, PoolType } from "../../graph/graph";
import { weightedPoolTokenInForExactTokenOut, weightedPoolTokenInForTokenOut } from "../../math/wieghtedPool";
import { bnum } from "../../utils/bigNumber";







export function handleWeightedPool(currPool: any, amount: string, usdPrice: number, kind: SwapType, tokenMap: any, tokenIn: any, tokenOut: any, graph: Graph) {
    try {

        const poolId = currPool.id;

        if (kind === SwapType.SwapExactIn) {

            const tokenInAmount = Big(amount).times(usdPrice)
                .times(10 ** tokenMap[tokenIn.address][2])
                .div(tokenMap[tokenIn.address][1])
                .toFixed(0);
            let parameters: [string, any] = [(tokenInAmount),
            {
                balanceIn: bnum(tokenIn.balance),
                balanceOut: bnum(tokenOut.balance),
                decimalsIn: bnum(tokenIn.decimals),
                decimalsOut: bnum(tokenOut.decimals),
                weightIn: bnum(tokenIn.weight),
                weightOut: bnum(tokenOut.weight),
                swapFee: bnum(currPool.swapFee)
            }]
            const tokenOutAmount = weightedPoolTokenInForTokenOut(...parameters);
            
            if(isNaN(Number(tokenOutAmount)) || Number(tokenOutAmount) < 0) {
                return
            }
            console.log("TOKENOUT__________",tokenOutAmount.toString(), currPool.id, tokenIn.address,  tokenOut.address);
            const actualAmountUSD = Big(tokenOutAmount.toString()).times(tokenMap[tokenOut.address][1]).toFixed(18);

            const expectedAmountUSD = Big(tokenInAmount)
                .div((10 ** tokenMap[tokenIn.address][2]))
                .times(tokenMap[tokenIn.address][1]).toFixed(18);

            let slipageUSD = Big(expectedAmountUSD).minus(actualAmountUSD).toNumber();
            // console.log("EP", expectedAmountUSD);
            // console.log("AA", actualAmountUSD.toString())
            // console.log(tokenIn.address)
            // console.log(tokenOut.address)
            // console.log(poolId)
            // console.log("Slipage", slipageUSD)
            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            const amountInTokenDecimal = Big(tokenInAmount).toFixed(0);

            const amountOutTokenDecimal = Big(tokenOutAmount.toString()).times(10 ** tokenMap[tokenOut.address][2]).toFixed(0);
           
            if (!slipageUSD) slipageUSD = 0;

            graph.addVertex(tokenIn.address);

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal, PoolType.Weighted, parameters, currPool.swapFee);
        }

        else if (kind === SwapType.SwapExactOut) {
            const tokenOutAmount = Big(amount).times(usdPrice)
                .times(10 ** tokenMap[tokenOut.address][2])
                .div(tokenMap[tokenOut.address][1])
                .toFixed(0);

            const parameters: [string, any] = [
                (tokenOutAmount),
                {
                    balanceIn: bnum(tokenIn.balance),
                    balanceOut: bnum(tokenOut.balance),
                    decimalsIn: bnum(tokenIn.decimals),
                    decimalsOut: bnum(tokenOut.decimals),
                    weightIn: bnum(tokenIn.weight),
                    weightOut: bnum(tokenOut.weight),
                    swapFee: bnum(currPool.swapFee)
                }
            ]
            const tokenInAmount = weightedPoolTokenInForExactTokenOut(...parameters);
            if(isNaN(Number(tokenInAmount)) || Number(tokenInAmount) < 0) {
                return
            }
            console.log("TOKENIN__________",tokenInAmount.toString(), currPool.id, tokenIn.address, tokenOut.address);
            const actualAmountUSD = Big(tokenInAmount.toString()).times(tokenMap[tokenIn.address][1]).toFixed(18);

            const expectedAmountUSD = Big(tokenOutAmount)
                .div((10 ** tokenMap[tokenOut.address][2]))
                .times(tokenMap[tokenOut.address][1]).toFixed(18);
            console.log("actual", actualAmountUSD, "exp", expectedAmountUSD)
            let slipageUSD = Big(actualAmountUSD).minus(expectedAmountUSD).toNumber();
            // console.log("EP", expectedAmount);
            // console.log("AA", actualAmount.toString())
            // console.log(tokenIn.address)
            // console.log(tokenOut.address)
            // console.log(poolId)
            // console.log("Slipage", slipage)

            slipageUSD = slipageUSD > 0 ? slipageUSD : 0;

            const amountInTokenDecimal = Big(tokenInAmount.toString()).times(10 ** tokenMap[tokenIn.address][2]).toFixed(0);

            const amountOutTokenDecimal = Big(tokenOutAmount).toFixed(0);

            if (!slipageUSD) slipageUSD = 0;

            graph.addVertex(tokenIn.address);

            graph.addEdge(tokenIn.address, tokenOut.address, slipageUSD, poolId, amountInTokenDecimal, amountOutTokenDecimal,PoolType.Weighted, parameters, currPool.swapFee);
        }
    }
    catch (error) {
        console.log("Error @ handleWeightedPool", error)
    }
}