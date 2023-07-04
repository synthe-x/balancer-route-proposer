import axios from "axios"
import { promises as fs } from "fs";



export async function setSynthsConfig() {
    try {

        let config = JSON.parse((await (fs.readFile(__dirname + "/synthexPoolConfig.json"))).toString());
        config = {};
        let data = await axios({

            method: "post",
            url: `https://graph.testnet.mantle.xyz/subgraphs/name/prasad-kumkar/synthex-mantleTestnet`,
            data:
            {
                query: 
              `{
                    pools{
                        id
                        name
                        symbol
                        oracle
                        feeToken
                        synths{
                            burnFee
                            mintFee
                            isActive
                            token{
                                id
                                symbol
                                decimals 
                            }
                        }
                   }
                }`
            }
        });



        const pools = data.data.data.pools;

        for (let pool of pools) {
            config[pool.id] = {
                name: pool.name,
                symbol: pool.symbol,
                feeToken: pool.feeToken,
                oracle: pool.oracle,
                synths: {}
            };

            for (let synth of pool.synths) {
                if (!synth.isActive) continue;
                config[pool.id]["synths"][synth.token.id] = {
                    symbol: synth.token.symbol,
                    burnFee: synth.burnFee,
                    mintFee: synth.mintFee,
                    priceUSD: "0"
                };

            }
        }
        await fs.writeFile(__dirname + "/synthexPoolConfig.json", JSON.stringify(config));

    }
    catch (error) {
        console.log(`Error @ getCollAddresses`, error)
    }
}


export function fetchSynthPoolData() {
    setSynthsConfig();
    setInterval(() => {
        setSynthsConfig()
    }, 1000 * 10)
}