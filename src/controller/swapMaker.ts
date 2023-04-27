import { swapMaker } from "../sor/swapMaker";







export async function getPath(req: any, res: any){
    try{

        const {tokenIn, tokenOut, amount, kind, slipage, sender, recipient, deadline } = req.params;

        const data = await swapMaker(amount, tokenIn, tokenOut, Number(kind), Number(slipage), sender, recipient, deadline);

        res.status(200).send({status: true, data: data});
    }
    catch(error){
        console.log("Error @ getPath", error)
    }
}