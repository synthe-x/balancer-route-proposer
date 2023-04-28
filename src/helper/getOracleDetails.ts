import Big from "big.js";
import { BigNumber, ethers } from "ethers";
import { provider } from "./constant";
import { promises as fs } from "fs";
import path from "path";
import { getABI } from "./getAbi";




/**
 * @dev this function is use to get pool synths prices
 * @param {*} input (string[][]) @ index object of synths, @ index 1 oracle address .
 */
async function _oracleMulticall(input: any) {
    try {

        const multicall = new ethers.Contract(
            "0x842eC2c7D803033Edf55E478F461FC547Bc54EB2",
            await getABI("Multicall2"),
            provider
        );

        const itf: ethers.utils.Interface = new ethers.utils.Interface(await getABI("PriceOracle"));

        const mInput: any = [];

        for (const i in input) {
            const synths = Object.keys(input[i][0]);

            mInput.push([input[i][1], itf.encodeFunctionData("getAssetsPrices", [synths])]);
        }

        const resp = await multicall.callStatic.aggregate(
            mInput
        );


        for (let i = 0; i < resp[1].length; i++) {

            let prices = itf.decodeFunctionResult("getAssetsPrices", resp[1][i])[0];

            for (let j = 0; j < prices.length; j++) {
                let synths = Object.keys(input[i][0]);
                input[i][0][`${synths[j]}`]["priceUSD"] = Big(prices[j]).div(1e8).toString();
            }
        }

        return input

    }
    catch (error) {
        console.log(`Error @ _oracleMulticall`, error)
        return null
    }
}
// fetchOracleData()
export async function fetchOracleData() {
    try {

        
        const config = JSON.parse((await fs.readFile(path.join(__dirname + "/synthexPoolConfig.json"))).toString());
        // setInterval(async () => {

            const poolAddresses = Object.keys(config);

            const input: any = [];
            for (let i in poolAddresses) {
                input.push([config[poolAddresses[i]]["synths"], config[poolAddresses[i]]["oracle"]]);
            }

            let outPut = await _oracleMulticall(input);

            for (let i = 0; i < outPut.length; i++) {
                config[poolAddresses[i]]["synths"] = outPut[i][0];
            }

            await fs.writeFile(path.join(__dirname + "/synthexPoolConfig.json"), JSON.stringify(config));

        // }, 10 * 1000)
        // let wait = new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         resolve("success");
        //     }, 10 * 1000)
        // });
        // await wait;
    }
    catch (error) {
        console.log(`Error @ fetchOracleData`, error);
    }
}

export async function getAllSynthsPrices(poolId: string, synthId: string) {
    let config = JSON.parse((await (fs.readFile(path.join(__dirname + "/synthexPoolConfig.json")))).toString());
    return config[poolId]["synths"][synthId]["priceUSD"];
};
