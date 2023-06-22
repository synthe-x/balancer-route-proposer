import express from 'express';
import { createServer } from "http";
import { routeProposer } from './src/sor/routeProposer';
import { Graph } from './src/graph/graph'
import { fetchOracleData } from './src/helper/getOracleDetails'
import { swapMaker } from "./src/sor/swapMaker";

import route from "./src/routes/route"
import { fetchPoolData } from './src/sor/graphData/graphquery';
const app = express();

const httpServer = createServer(app);

app.use(express.json());
app.use("/", route)

let server = httpServer.listen(3010, function () {
    console.log("app running on port " + (3010));
});


// let g = new Graph();
// a("1")
// routeProposer("100", "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42", "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", 0);
// fetchOracleData()
fetchPoolData()
// routeProposer("100", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", "0x3082cc23568ea640225c2467653db90e9250aaa0", 1);

// swapMaker("100", "0x6694340fc020c5E6B96567843da2df01b2CE1eb6", "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", 0);
function stop() {
    server.close();
}

module.exports = server;
module.exports.stop = stop;