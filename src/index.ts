import express from 'express';
import route from "./routes/route"
import { fetchPoolData } from './sor/subGraphData/graphquery';
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
const app = express();
app.use(express.json());

app.use(cors({
    origin: '*'
}));
app.use(helmet());
app.use(morgan("tiny"));
app.use(compression());

app.use("/", route)
// fetchOracleData()
fetchPoolData()

export default app;
