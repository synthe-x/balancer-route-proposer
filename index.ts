import express from 'express';
import { createServer } from "http";
import { a, b } from './src/sor';
import {Graph} from './src/graph/graph'
const app = express();

const httpServer = createServer(app);



let server = httpServer.listen(3010, function () {
    console.log("app running on port " + (3010));
});
let g = new Graph(10);
// a("1")
// b("100", "0x912ce59144191c1204e64559fe8253a0e49e6548", "0x5979d7b546e38e414f7e9822514be443a4800529");
function stop() {
    server.close();
}

module.exports = server;
module.exports.stop = stop;