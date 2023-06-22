import { Request, Response } from "express";
import { swapMaker } from "../sor/swapMaker";
import { ERROR } from "../utils/error";







export async function getPath(req: Request, res: Response) {
    try {

        const { tokenIn, tokenOut, amount, kind, slipage, sender, recipient, deadline } = req.body;

        const input = [tokenIn, tokenOut, amount, kind, slipage, sender, recipient, deadline]
        for (let e of input) {
            
            if (e === undefined) {
                return res.status(400).send({ status: false, error: ERROR.PROPERTY_MISSING_IN_REQ_BODY });

            }
        }
        const data = await swapMaker(amount, tokenIn, tokenOut, kind, slipage, sender, recipient, deadline);

        if (typeof data == 'object' && "status" in data || data === undefined) {

            if (data == undefined) {
                return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR })
            }
            return res.status(data.statusCode).send({ status: false, error: data.error })
        }

        return res.status(200).send({ status: true, data: data });
    }
    catch (error) {
        console.log("Error @ getPath", error)
    }
}

