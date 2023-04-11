




export const queryStr = `{
  
    pools(first: 30, orderBy:totalLiquidity, orderDirection: desc, where:{poolType_in: ["Stable","Weighted"]}) {
        id
        name
        address
        poolType
        swapFee
        poolTypeVersion
        totalLiquidity
        tokensList
        totalWeight
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