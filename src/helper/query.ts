




export const queryStr = `{
  
    pools(first: 20, orderBy:totalLiquidity, orderDirection: desc, where:{poolType_in: ["Weighted","Stable"]}) {
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