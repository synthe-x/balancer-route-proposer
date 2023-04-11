import express from 'express';
import { createServer } from "http";
import { routeProposer } from './src/sor';
import {Graph} from './src/graph/graph'
import{fetchOracleData} from './src/helper/getOracleDetails'
import {swapMaker} from "./src/sor/swapMaker"
const app = express();

const httpServer = createServer(app);



let server = httpServer.listen(3010, function () {
    console.log("app running on port " + (3010));
});
// let g = new Graph();
// a("1")
// routeProposer("100", "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 0);
// fetchOracleData()
// routeProposer("10", "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 0);
swapMaker("100", "0x6694340fc020c5E6B96567843da2df01b2CE1eb6", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 0);
function stop() {
    server.close();
}

module.exports = server;
module.exports.stop = stop;