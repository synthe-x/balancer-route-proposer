
import { PriorityQueue } from "./pQueue";
import { Queue } from "./queue";




const pq = new PriorityQueue();
// For non directed graph
export class Graph {
    noOfVertices: number;
    adList: Map<any, any>;
    constructor(noOfVertices: number) {
        this.noOfVertices = noOfVertices;
        // represent whole graph connections
        this.adList = new Map();
    }

    addVertex(asset: any) {

        if (!this.adList.get(asset)) {
            this.adList.set(asset, []);
        }
    }

    addEdge(asset: any, conAsset: string, slipage: number, pool?: string) {
        //this is adding edge asset to conAsset.
        this.adList.get(asset).push({ conAsset: conAsset, slipage: slipage, pool: pool });

        //this is adding conAsset target to Asset.
        // this.adList.get(conAsset).push({ conAsset: asset, slipage: slipage, pool: pool });
    };

    printGraph() {
        const keys = this.adList.keys();

        for (let ele of keys) {

            console.log(`${ele}:`, this.adList.get(ele))
        }
    }

    bfs(vertex: any, visited: any = {}) {

        const queue = new Queue();

        queue.enQueue(vertex);
        visited[vertex] = true;
        while (!queue.isEmpty()) {
            const ele = queue.deQueue();
            console.log("Ele", ele);
            const vertices = this.adList.get(ele);

            for (let e of vertices) {

                if (!visited[e.conAsset]) {
                    visited[e.conAsset] = true;
                    queue.enQueue(e.conAsset);

                }
            }
        }
    }

    bft() {
        let visited: any = {};
        let disconnetedCount: number = 0;
        for (let key of this.adList.keys()) {

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

        for (let ele of this.adList.get(vertex)) {

            if (!visited[ele]) {
                this.dfs(ele, visited);
            }
        }

    }

    dft() {
        let visited: any = {};
        let disconnetedCount: number = 0;
        for (let key of this.adList.keys()) {

            if (!visited[key]) {
                disconnetedCount++
                this.dfs(key, visited);
                visited[key] = true;
            };

        }
        console.log("Dis Count", disconnetedCount);
    }

    dijkstra(source: any, endSource?: any) {

        let visited: any = {}

        let dist: any = {};

        for (let ele of this.adList.keys()) {
            dist[ele] = { slipage: Infinity };
        }

        if (dist[source] == undefined) {
            return console.log("Token not available")
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
            let sourceAdj = this.adList.get(newSource);

            sourceAdj = sourceAdj.sort((a: any, b: any) => {
                return a.slipage - b.slipage
            });

            for (let ele of sourceAdj) {

                if (!dist[ele.conAsset]) continue;

                if (Number(dist[ele.conAsset]["slipage"]) > Number(dist[newSource]["slipage"]) + Number(ele.slipage)) {

                    dist[ele.conAsset] = { slipage: Number(dist[newSource]["slipage"]) + Number(ele.slipage) };
                    // console.log(Number(dist[newSource]["slipage"]) + Number(ele.slipage))
                    dist[ele.conAsset]["pool"] = ele.pool;

                    dist[ele.conAsset]["asset"] = [newSource, ele.conAsset];

                }
                if (visited[ele.conAsset]) {
                    continue;
                }
                pq.enqueue(ele.conAsset, dist[ele.conAsset])

            }

        }
        // console.log(dist)

        return dist
    }
}

const g = new Graph(7);

g.addVertex("USDT")
g.addVertex("ETH")
g.addVertex("BTC")
g.addVertex("USDC")
g.addVertex("cUSD");
g.addVertex("fUSD");


// g.printGraph()

g.addEdge("USDT", "ETH", 1, "abcd");
g.addEdge("ETH", "USDT", 2, "abcd");
g.addEdge("ETH", "BTC", 2, "abcd");
g.addEdge("USDC", "USDT", 1, "abcd");
g.addEdge("USDT", "USDC", 5, "abcd");
g.addEdge("USDC", "fUSD", 2, "abcd");
g.addEdge("USDC", "cUSD", 1, "abcd");
g.addEdge("BTC", "ETH", 1, "abcd");
g.addEdge("BTC", "fUSD", 1, "abcd");
g.addEdge("cUSD", "USDC", 1, "abcd");
g.addEdge("cUSD", "fUSD", 1, "abcd");
g.addEdge("fUSD", "BTC", 2, "abcd");
g.addEdge("fUSD", "cUSD", 1, "abcd");
g.addEdge("fUSD", "USDC", 1, "abcd");



// g.printGraph();

console.log(g.dijkstra("ETH"))

// g.bfs("USDC");
// g.bft();
// console.log("---------------")
// g.dfs("A")
// g.dft()


