import express from 'express';
import { createServer } from "http";
import { routeProposer } from './src/sor';
import {Graph} from './src/graph/graph'
import{fetchOracleData} from './src/helper/getOracleDetails'
const app = express();

const httpServer = createServer(app);



let server = httpServer.listen(3010, function () {
    console.log("app running on port " + (3010));
});
// let g = new Graph();
// a("1")
// routeProposer("100", "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 0);
fetchOracleData()
function stop() {
    server.close();
}

module.exports = server;
module.exports.stop = stop;