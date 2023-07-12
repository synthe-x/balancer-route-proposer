import axios from "axios"
import { promises as fs } from "fs";


require("dotenv").config();
export async function setSynthsConfig() {
    try {

        let config = JSON.parse((await (fs.readFile(__dirname + "/synth-pool-config.json"))).toString());
        config = {};
        let data = await axios({

            method: "post",
            url: process.env.SYNTH_POOL_SUBGRAPH,
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
        await fs.writeFile(__dirname + "/synth-pool-config.json", JSON.stringify(config));

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