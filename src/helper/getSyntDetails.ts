import axios from "axios"
import { promises as fs } from "fs";


setSynthsConfig()

export async function setSynthsConfig() {
    try {

        let config = JSON.parse((await (fs.readFile(__dirname + "/synthexPoolConfig.json"))).toString());
        config = {};
        let data = await axios({

            method: "post",
            url: `https://api.thegraph.com/subgraphs/name/prasad-kumkar/synthex-dev`,
            data:
            {
                query: `
                {
                    pools{
                        id
                        name
                        symbol
                        oracle
                        feeToken
                        synths{
                            burnFee
                            mintFee
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