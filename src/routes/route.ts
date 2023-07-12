

import express from "express";
import { getPath} from "../controller/route-proposer.controller";

const router = express.Router();


router.get("/getPath",getPath)

router.get("/",(_, res)=> res.status(200).send("Welcome to SOR"));
// router.get("/test",test)
export default router;