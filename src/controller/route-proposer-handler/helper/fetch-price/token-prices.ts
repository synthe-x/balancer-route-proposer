import axios from "axios";









let priceData: any = {};


async function updatePrice() {
    try {
        let data;
        const pricesEndPoint = process.env.PRICE_ENDPOINT!;
        if(!pricesEndPoint) {
            throw Error("PRICE_ENDPOINT Not found @ .env")
        }
        try {
            data = await axios.get(pricesEndPoint);
        }
        catch (error) {
            console.log(`Error @ call axios updatePrice: ${error}`);
            return
        }
        priceData = data.data.data;
    }
    catch (error) {
        console.log(`Error @ updatePrice: Error: ${error}`)
    }
}

export function getPrices(adsress: string) {
    return priceData[adsress] ? Number(priceData[adsress][0]) : undefined;
}

export function startUpdatePrice() {
    try {
        updatePrice()
        setInterval(() => {
            updatePrice()
        },5000);
    }
    catch (error) {
        console.log(`Error @ startUpdatePrice: ${error}`)
    }
}