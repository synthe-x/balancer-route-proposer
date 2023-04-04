




export const queryStr = `{
  
        pools(first: 30, orderBy:totalLiquidity, orderDirection: desc) {
          id
          name
          address
          poolType
          poolTypeVersion
          totalLiquidity
          tokens{
            address
            symbol
            decimals
            token{
              latestUSDPrice
              latestFXPrice
            }
          }
        }
      }`