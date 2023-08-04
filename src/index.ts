import express from 'express';
import route from "./routes/route"

import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { startUpdatePrice } from './controller/route-proposer-handler/helper/fetch-price/token-prices';
import { fetchSynthPoolData } from './controller/route-proposer-handler/handler/synth-pool/get-synth-details';
import { fetchPoolData } from './controller/route-proposer-handler/handler/balancer-pool/fetch-data';


const app = express();
app.use(express.json());

app.use(cors({
    origin: '*'
}));
app.use(helmet());
app.use(morgan("tiny"));
app.use(compression());

app.use("/", route)
fetchSynthPoolData()
fetchPoolData()
startUpdatePrice()

export default app;
