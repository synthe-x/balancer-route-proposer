




export const queryStr = `{
  
    pools(first: 20, orderBy:totalLiquidity, orderDirection: desc, where:{poolType_in: ["ComposableStable","Weighted"]}) {
        id
        address
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
          pool{
            id
          }
            latestUSDPrice
            
        }
      }
    }
  }`