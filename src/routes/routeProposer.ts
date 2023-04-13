

import express from "express";
import { getPath } from "../controller/swapMaker";

const router = express.Router();


router.get("/getPath/:tokenIn/:tokenOut/:amount/:kind",getPath)

export default router;