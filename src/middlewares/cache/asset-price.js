const { getJson } = require('../../libs/http-request')
 
class AssetPriceCache {
    constructor(){
        this.prices = {
            eth_usd: 0,
            gno_usd: 0
        }
        this.updatedAt = null;
    }

    async UpdatePrice(){
        try {
            const price = await getJson(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum,gnosis`);
            const eth = price?.ethereum?.usd;
            const gno = price?.gnosis?.usd;

            if (Number.isFinite(eth)) this.prices.eth_usd = eth;
            if (Number.isFinite(gno)) this.prices.gno_usd = gno;

            this.updatedAt = new Date();
        } catch(e){
            console.error(e);
        }
        return this.Get();
    }

    Get(){
        return { ...this.prices, updatedAt: this.updatedAt }
    }

    ActivateCron(){
        this.UpdatePrice = this.UpdatePrice.bind(this);
        setInterval(this.UpdatePrice, 3_600_000);
    }
}

const priceCache = new AssetPriceCache();
module.exports = priceCache;