
import { BigNumber as  bnum } from '../utils/bigNumber';







export function weightedPoolTokenInForTokenOut(
    amount: any,
    poolPairData: any
): any {
    const Bi =
        parseFloat(poolPairData.balanceIn)
        ;
    const Bo =
    parseFloat(poolPairData.balanceOut)
        ;
    const wi = parseFloat(poolPairData.weightIn);
    const wo = parseFloat(poolPairData.weightOut);
    const Ai = amount / (10 ** poolPairData.decimalsIn) ;
    const f = parseFloat(poolPairData.swapFee);
    // console.log(Bi, Bo, wi, wo, Ai, f)
    return bnum(Bo * (1 - (Bi / (Bi + Ai * (1 - f))) ** (wi / wo)));
   
}