
import { ERROR } from "../error";
import { IDijkstraResponse, PoolType } from "../types";
import { PriorityQueue } from "./pQueue";






// const pq = new PriorityQueue();
// For non directed graph
export class Graph {

    noOfVertices: number = 0;
    addList: Map<string, any>;
    constructor() {
        // represent whole graph connections
        this.addList = new Map();
    }

    addVertex(asset: string) {

        if (!this.addList.get(asset)) {
            this.addList.set(asset, []);
            this.noOfVertices++
        }
    }


    addEdge(asset: string, conToken: string, slipage: number, pool: string, amountIn: string, amountOut: string, poolType: PoolType, parameters: any, swapFee: string) {
        //this is adding edge asset to connectingToken
        this.addVertex(asset);
        this.addList.get(asset).push({ conToken, slipage, pool, amountIn, amountOut, poolType, parameters, swapFee });

        //this is adding conToken target to Asset.
        // this.addList.get(conToken).push({ conToken: asset, slipage: slipage, pool: pool });
    };

    printGraph() {
        const keys = this.addList.keys();

        for (let ele of keys) {

            console.log(`${ele}:`, this.addList.get(ele))
        }
    }
    /*
    bfs(vertex: any, visited: any = {}) {

        const queue = new Queue();

        queue.enQueue(vertex);
        visited[vertex] = true;
        while (!queue.isEmpty()) {
            const ele = queue.deQueue();
            console.log("Ele", ele);
            const vertices = this.addList.get(ele);

            for (let e of vertices) {

                if (!visited[e.conToken]) {
                    visited[e.conToken] = true;
                    queue.enQueue(e.conToken);

                }
            }
        }
    }

    bft() {
        let visited: any = {};
        let disconnetedCount: number = 0;
        for (let key of this.addList.keys()) {

            if (!visited[key]) {
                disconnetedCount++
                this.bfs(key, visited);
                visited[key] = true;
            };

        }
        console.log("Dis count", disconnetedCount);
    }

    dfs(vertex: any, visited: any = {}) {

        visited[vertex] = true;
        console.log(vertex);

        for (let ele of this.addList.get(vertex)) {

            if (!visited[ele]) {
                this.dfs(ele, visited);
            }
        }

    }

    dft() {
        let visited: any = {};
        let disconnetedCount: number = 0;
        for (let key of this.addList.keys()) {

            if (!visited[key]) {
                disconnetedCount++
                this.dfs(key, visited);
                visited[key] = true;
            };

        }
        console.log("Dis Count", disconnetedCount);
    }*/

    dijkstra(source: string, endSource?: any) {
        const pq: PriorityQueue = new PriorityQueue();
        let visited: any = {}

        let dist: any = {};

        for (let token of this.addList.keys()) {
            dist[token] = { slipage: Infinity };
            dist[token]["amount"] = "0";
        }

        if (dist[source] == undefined) {
            return { status: false, error: ERROR.TOKEN_NOT_FOUND, statusCode: 400 }
        }

        dist[source]["slipage"] = 0;

        pq.enqueue(source, 0);


        while (!pq.isEmpty()) {

            if (visited[endSource]) {
                break;
            }

            const newSource = pq.front().element; // return minimum value.

            if (visited[newSource]) {
                pq.dequeue();
                continue;
            }

            visited[newSource] = true

            pq.dequeue()

            let sourceAdj = this.addList.get(newSource);

            if (!sourceAdj) {
                continue;
            }
            sourceAdj = sourceAdj.sort((a: any, b: any) => {
                return a.slipage - b.slipage
            });

            for (let token of sourceAdj) {

                if (!dist[token.conToken]) continue;

                if (visited[token.conToken]) {
                    continue;
                }

                if (Number(dist[token.conToken]["slipage"]) > Number(dist[newSource]["slipage"]) + Number(token.slipage)) {

                    dist[token.conToken] = { slipage: Number(dist[newSource]["slipage"]) + Number(token.slipage) };

                    dist[token.conToken]["pool"] = token.pool;

                    dist[token.conToken]["assets"] = { assetIn: newSource, assetOut: token.conToken };

                    dist[token.conToken]["amountIn"] = token.amountIn;

                    dist[token.conToken]["amountOut"] = token.amountOut;

                    // dist[token.conToken]["decimalIn"] = token.decimalIn;

                    // dist[token.conToken]["decimalOut"] = token.decimalOut;

                    dist[token.conToken]["poolType"] = token.poolType;

                    dist[token.conToken]["parameters"] = token.parameters;

                    dist[token.conToken]["swapFee"] = token.swapFee;

                }

                pq.enqueue(token.conToken, Number(dist[token.conToken]["slipage"]))

            }

        }

        return dist as { [key: string]: IDijkstraResponse }
    }
}

// const g = new Graph();

// g.addVertex("USDT")
// g.addVertex("ETH")
// g.addVertex("BTC")
// g.addVertex("USDC")
// g.addVertex("cUSD");
// g.addVertex("fUSD");


// // g.printGraph()

// g.addEdge("USDT", "ETH", 1, "abcd");
// g.addEdge("ETH", "USDT", 2, "abcd");
// g.addEdge("ETH", "BTC", 2, "abcd");
// g.addEdge("USDC", "USDT", 1, "abcd");
// g.addEdge("USDT", "USDC", 6, "abcd");
// g.addEdge("USDC", "fUSD", 2, "abcd");
// g.addEdge("USDC", "cUSD", 1, "abcd");
// g.addEdge("BTC", "ETH", 1, "abcd");
// g.addEdge("BTC", "fUSD", 1, "abcd");
// g.addEdge("cUSD", "USDC", 1, "abcd");
// g.addEdge("cUSD", "fUSD", 1, "abcd");
// g.addEdge("fUSD", "BTC", 2, "abcd");
// g.addEdge("fUSD", "cUSD", 1, "abcd");
// g.addEdge("fUSD", "USDC", 1, "abcd");



// g.printGraph();

// console.log(g.dijkstra("USDT", 10, "cUSD"))

// g.bfs("USDC");
// g.bft();
// console.log("---------------")
// g.dfs("A")
// g.dft()


