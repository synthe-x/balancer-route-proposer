




export const queryStr = `{
  
    pools(first: 20, orderBy:totalLiquidity, orderDirection: desc, where:{poolType_in: ["Stable","Weighted"]}) {
        id
        poolType
        swapFee
        amp
        tokens{
        weight
        balance
        address
        symbol
        decimals
        token{
            latestUSDPrice
            
        }
      }
    }
  }`