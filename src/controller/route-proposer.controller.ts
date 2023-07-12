import { Request, Response } from "express";
import { ERROR } from "./route-proposer-handler/utils/error";
import { routeProposer } from "./route-proposer-handler/route-proposer";









export async function getPath(req: Request, res: Response) {
    try {


        const { tokenIn, tokenOut, amount, kind, slipage, recipient, deadline } = req.query as any;

        const input = [tokenIn, tokenOut, amount, kind, slipage, recipient, deadline];

        for (let e of input) {

            if (e === undefined || !e) {
                return res.status(400).send({ status: false, error: ERROR.PROPERTY_MISSING_IN_REQ_QUERY });
            }
        }

        const data = await routeProposer({ amount, t1: tokenIn, t2: tokenOut, kind: Number(kind), slipage: Number(slipage), recipient, deadline: Number(deadline) });

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

