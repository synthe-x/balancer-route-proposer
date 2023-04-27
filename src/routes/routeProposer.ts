

import express from "express";
import { getPath } from "../controller/swapMaker";

const router = express.Router();


router.get("/getPath/:tokenIn/:tokenOut/:amount/:kind/:sender/:recipient/:deadline/:slipage",getPath)

export default router;