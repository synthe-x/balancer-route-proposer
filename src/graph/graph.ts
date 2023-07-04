
import { ERROR } from "../utils/error";
import { IDijkstraResponse, PoolType } from "../utils/types";
import { PriorityQueue } from "./pQueue";







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




