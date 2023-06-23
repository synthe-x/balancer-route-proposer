import express from 'express';
import route from "./routes/route"
import { fetchPoolData } from './sor/subGraphData/graphquery';
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from 'express-rate-limit'
const app = express();
app.use(express.json());

app.use(cors({
    origin: '*'
}));
app.use(helmet());
app.use(morgan("tiny"));
app.use(compression());


const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 80,
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)
app.use("/", route)
// fetchOracleData()
fetchPoolData()

export default app;
