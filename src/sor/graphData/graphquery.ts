import axios from "axios";
import { queryStr } from "../../helper/query";











let pools: any = [];
let tokensPrice: any = {};



async function _fetchPoolData(){
    try{
        let arbitrum = "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2"
        let data = await axios({
            method: "post",
            url: arbitrum,
            data:
            {
                query: queryStr
            }
        });

        pools = data.data.data.pools;

        for(const pool of pools) {

            for(const token of pool.tokens){
                tokensPrice[token.address] = token.token.latestUSDPrice ?? "0"
            }
        }
        // console.log(tokensPrice)
    }
    catch(error){
        console.log("Error @ fetchPoolData", error)
    }
}

export function fetchPoolData(){
    _fetchPoolData();
    setInterval(()=>{
        _fetchPoolData()
    }, 1000 * 10)
}


export function getPools() {
    return pools
}

export function getTokenPrice(address: string){
    return tokensPrice[address]
}