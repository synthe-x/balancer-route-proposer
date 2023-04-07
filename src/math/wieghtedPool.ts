
// import { formatFixed } from '@ethersproject/bignumber';

import { formatFixed } from '@balancer-labs/sdk';
import { BigNumber as OldBigNumber, bnum } from '../utils/bigNumber';


// PairType = 'token->token'
// SwapType = 'swapExactIn'



//  export function weightedPoolTokenInForTokenOut(
//     amount: any,
//     poolPairData: any
// ): any {
//     const Bi = parseFloat(
//         formatFixed(poolPairData.balanceIn, poolPairData.decimalsIn)
//     );
//     const Bo = parseFloat(
//         formatFixed(poolPairData.balanceOut, poolPairData.decimalsOut)
//     );
//     const wi = parseFloat(formatFixed(poolPairData.weightIn, 18));
//     const wo = parseFloat(formatFixed(poolPairData.weightOut, 18));
//     const Ai = amount.toNumber();
//     const f = parseFloat(formatFixed(poolPairData.swapFee, 18));
//     return bnum(Bo * (1 - (Bi / (Bi + Ai * (1 - f))) ** (wi / wo)));
//     // return Bo.times(
//     //     bnum(1).minus(
//     //         bnum(
//     //             Bi.div(
//     //                 Bi.plus(Ai.times(bnum(1).minus(f)))
//     //             ).toNumber() ** wi.div(wo).toNumber()
//     //         )
//     //     )
//     // )
// }

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
    const Ai = amount / 10 ** 18 ;
    const f = parseFloat(poolPairData.swapFee);
    console.log(Bi, Bo, wi, wo, Ai, f)
    return bnum(Bo * (1 - (Bi / (Bi + Ai * (1 - f))) ** (wi / wo)));
    // return Bo.times(
    //     bnum(1).minus(
    //         bnum(
    //             Bi.div(
    //                 Bi.plus(Ai.times(bnum(1).minus(f)))
    //             ).toNumber() ** wi.div(wo).toNumber()
    //         )
    //     )
    // )
}