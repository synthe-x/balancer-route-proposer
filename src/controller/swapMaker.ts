import { swapMaker } from "../sor/swapMaker";







export async function getPath(req: any, res: any){
    try{

        const {tokenIn, tokenOut, amount, kind} = req.params;

        const data = await swapMaker(amount, tokenIn, tokenOut, Number(kind));

        res.status(200).send({status: true, data: data});
    }
    catch(error){
        console.log("Error @ getPath", error)
    }
}