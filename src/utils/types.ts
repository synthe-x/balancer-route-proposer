
import { SwapType } from "@balancer-labs/sdk";
import { BigNumber as bnum } from "./bigNumber";

export interface IConstantPrices {
    [key: string]: string
}

export interface IPool {
    id: string;
    poolType: string;
    swapFee: string;
    amp: string | null;
    tokens: IToken[]
}

export interface IToken {
    weight: string | null;
    balance: string;
    address: string;
    symbol: string;
    decimals: number;
    token: {
        latestUSDPrice: string | null
    }
}

export type ITokenMap = { [key: string]: [string, string, number] };

export interface IPoolPairData {
    balanceIn: bnum;
    balanceOut: bnum;
    decimalsIn: bnum;
    decimalsOut: bnum;
    weightIn: bnum;
    weightOut: bnum;
    swapFee: bnum;
}

export interface IDijkstraResponse {
    slipage: number,
    pool: string,
    assets: {
        assetIn: string,
        assetOut: string
    },
    amountIn: string,
    amountOut: string,
    poolType: PoolType,
    parameters: any,
    swapFee: string
}


export enum PoolType {
    Synthex,
    Weighted,
    Stable
}

export interface IError {
    status: boolean;
    error: string;
    statusCode: number;
}

export interface ISwapData {
    poolId: string;
    assetInIndex: string;
    assetOutIndex: string;
    amountIn: string;
    amountOut: string;
    amount?: string;
    parameters: any,
    userData: string,
    assets: {
        assetIn: string,
        assetOut: string
    },
    poolType: PoolType,
    swapFee: string,
}

export interface IRouteProposer {
    amount: string,
    t1: string,
    t2: string,
    kind: SwapType,
    slipage: number,
    sender: string,
    recipient: string,
    deadline: number
}