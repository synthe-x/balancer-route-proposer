

// import {
//     BigNumber as OldBigNumber,
//     bnum,
//     ZERO,
//     ONE,
// } from '../utils/bigNumber';
// import { WeiPerEther as EONE } from '@ethersproject/constants';
// import { BigNumber, formatFixed } from '@ethersproject/bignumber';

// export function stablePoolexactTokenInForTokenOut(
//     amount: OldBigNumber,
//     poolPairData: any
// ): OldBigNumber {
//     // The formula below returns some dust (due to rounding errors) but when
//     // we input zero the output should be zero
//     if (amount.isZero()) return amount;
//     let { amp, allBalances, tokenIndexIn, tokenIndexOut, swapFee }: {
//         amp: BigNumber, allBalances: OldBigNumber[], tokenIndexIn: number, tokenIndexOut: number, swapFee: OldBigNumber
//     } =
//         poolPairData;
//     const balances = [...allBalances];
//     let tokenAmountIn = amount;

//     tokenAmountIn = tokenAmountIn.minus(tokenAmountIn.times(swapFee))
//     // tokenAmountIn = tokenAmountIn
//     //     .times(bnum("1000000000000000000").minus(swapFee))
//     //     .div(bnum("1000000000000000000"));
    
//     // tokenAmountIn = tokenAmountIn
//     // .times(EONE.sub(swapFee).toString())
//     // .div(EONE.toString());

//     console.log("tokenIn ------", tokenAmountIn.toString())

//     //Invariant is rounded up
//     const inv = _invariant(amp, balances);
//     let p = inv;
//     let sum = ZERO;
//     const totalCoins = bnum(balances.length);
//     let n_pow_n = ONE;
//     let x = ZERO;
//     for (let i = 0; i < balances.length; i++) {
//         n_pow_n = n_pow_n.times(totalCoins);

//         if (i == tokenIndexIn) {
//             x = balances[i].plus(tokenAmountIn);
//         } else if (i != tokenIndexOut) {
//             x = balances[i];
//         } else {
//             continue;
//         }
//         sum = sum.plus(x);
//         //Round up p
//         p = p.times(inv).div(x);
//     }

//     //Calculate out balance
//     // console.log(sum.toString(), inv.toString(), amp.toString(), n_pow_n.toString(), p.toString())
//     const y = _solveAnalyticalBalance(sum, inv, amp, n_pow_n, p);

//     //Result is rounded down
//     // return balances[tokenIndexOut] > y ? balances[tokenIndexOut].minus(y) : 0;
//     return balances[tokenIndexOut].minus(y);
// }


// export function _solveAnalyticalBalance(
//     sum: OldBigNumber,
//     inv: OldBigNumber,
//     amp: BigNumber,
//     n_pow_n: OldBigNumber,
//     p: OldBigNumber
// ): OldBigNumber {
//     // amp is passed as an ethers bignumber while maths uses bignumber.js
//     // const oldBN_amp = bnum(amp.div(1000).toString());
//     const oldBN_amp = bnum(amp.toString());
//     //Round up p
//     p = p.times(inv).div(oldBN_amp.times(n_pow_n).times(n_pow_n));
//     //Round down b
//     const b = sum.plus(inv.div(oldBN_amp.times(n_pow_n)));
//     //Round up c
//     // let c = inv >= b
//     //     ? inv.minus(b).plus(Math.sqrtUp(inv.minus(b).times(inv.minus(b)).plus(p.times(4))))
//     //     : Math.sqrtUp(b.minus(inv).times(b.minus(inv)).plus(p.times(4))).minus(b.minus(inv));
//     let c;
//     if (inv.gte(b)) {
//         c = inv
//             .minus(b)
//             .plus(inv.minus(b).times(inv.minus(b)).plus(p.times(4)).sqrt());
//     } else {
//         c = b
//             .minus(inv)
//             .times(b.minus(inv))
//             .plus(p.times(4))
//             .sqrt()
//             .minus(b.minus(inv));
//     }
//     //Round up y
//     return c.div(2);
// }



// /**********************************************************************************************
//     // invariant                                                                                 //
//     // D = invariant to compute                                                                  //
//     // A = amplifier                n * D^2 + A * n^n * S * (n^n * P / D^(n−1))                  //
//     // S = sum of balances         ____________________________________________                  //
//     // P = product of balances    (n+1) * D + ( A * n^n − 1)* (n^n * P / D^(n−1))                //
//     // n = number of tokens                                                                      //
//     **********************************************************************************************/
// export function _invariant(
//     amp: BigNumber, // amp
//     balances: OldBigNumber[] // balances
// ): OldBigNumber {
//     let sum = ZERO;
//     const totalCoins = balances.length;
//     for (let i = 0; i < totalCoins; i++) {
//         sum = sum.plus(balances[i]);
//     }
//     if (sum.isZero()) {
//         return ZERO;
//     }
//     let prevInv = ZERO;
//     let inv = sum;

//     // amp is passed as an ethers bignumber while maths uses bignumber.js
//     // const ampAdjusted = bnum(formatFixed(amp, 3))
//     // const ampAdjusted =bnum(amp.div(1000).toString());
//     const ampAdjusted =bnum(amp.toString());
//     const ampTimesNpowN = ampAdjusted.times(totalCoins ** totalCoins); // A*n^n
//     // const ampTimesNpowN = ampAdjusted.times(totalCoins); // A*n^n

//     for (let i = 0; i < 255; i++) {
//         let P_D = bnum(totalCoins).times(balances[0]);
//         for (let j = 1; j < totalCoins; j++) {
//             //P_D is rounded up
//             P_D = P_D.times(balances[j]).times(totalCoins).div(inv);
//         }
//         prevInv = inv;
//         //inv is rounded up
//         inv = bnum(totalCoins)
//             .times(inv)
//             .times(inv)
//             .plus(ampTimesNpowN.times(sum).times(P_D))
//             .div(
//                 bnum(totalCoins + 1)
//                     .times(inv)
//                     .plus(ampTimesNpowN.minus(1).times(P_D))
//             );
//         // Equality with the precision of 1
//         if (inv.gt(prevInv)) {
//             if (inv.minus(prevInv).lt(bnum(10 ** -18))) {
//                 break;
//             }
//         } else if (prevInv.minus(inv).lt(bnum(10 ** -18))) {
//             break;
//         }
//     }
//     //Result is rounded up
//     return inv;
// }