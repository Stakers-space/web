class ExecutionChainData {
    constructor() {
        // data structure
        this.id = null;
        this.partitionKey = "etherchain";
        this.day = null;
        this.timestamp = null;
        //this.date = null;
        this.totalSupply = null;
        this.marketCap = null;
        this.blockGasUsage = null;
        this.totalGasUsage = null;
        this.dailyTxRewards = null;
        this.burnedFees = null;
        this.dailyBlockCount = null;
        this.blockTime = null;
        this.blockGasLimit = null;
        this.avgBlockUsage = null;
        this.transactions = null;
    }

    ConvertToChartsArray(etherchainArr, startIndex = 0){
        var chartsArray = {
            day:[],
            timestamp: [],
            date:[],
            totalSupply: [],
            marketCap: [],
            marketCap_change: [],
            price: [],
            blockGasUsage: [],
            totalGasUsage: [],
            dailyTxRewards: [],
            emission: [],
            burnedFees: [],
            dailyBlockCount: [],
            blockTime: [],
            blockGasLimit: [],
            avgBlockUsage: [],
            transactions: []
        };

        if(!Array.isArray(etherchainArr)){
            console.warn("Missing etherchainArr data");
            return chartsArray;
        }

        const arrSize = etherchainArr.length;
        if(startIndex < 0) startIndex = arrSize + startIndex;
        for(var i=startIndex;i<arrSize;i++){
            const dayData = etherchainArr[i];
            //console.log(i, dayData.marketCap);
            chartsArray.day.push(dayData.day);
            chartsArray.timestamp.push(dayData.timestamp);
            chartsArray.totalSupply.push(dayData.totalSupply); // → Price
            chartsArray.marketCap.push(dayData.marketCap); // → Price
            chartsArray.blockGasUsage.push(dayData.blockGasUsage);
            chartsArray.totalGasUsage.push(dayData.totalGasUsage);
            chartsArray.burnedFees.push(dayData.burnedFees);
            chartsArray.dailyBlockCount.push(dayData.dailyBlockCount);
            chartsArray.dailyTxRewards.push(dayData.dailyTxRewards);
            chartsArray.blockTime.push(dayData.blockTime);
            chartsArray.blockGasLimit.push(dayData.blockGasLimit);
            chartsArray.avgBlockUsage.push(dayData.avgBlockUsage);
            chartsArray.transactions.push(dayData.transactions);

            // calculations
            chartsArray.emission.push(dayData.totalSupply - ((i === 0) ? 0 : etherchainArr[i - 1].totalSupply));
            chartsArray.marketCap_change.push(dayData.marketCap - ((i===0) ? 0 : etherchainArr[i - 1].marketCap));
            chartsArray.price.push(dayData.marketCap / dayData.totalSupply);
            chartsArray.date.push(new Date(dayData.timestamp).toLocaleDateString('en-US'));
        }
        //console.log(chartsArray.marketCap_change);

        return chartsArray;
    }

    GetResults(obj, limit){
        let result = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
                result[key] = obj[key].slice(limit);
            }
        }
        return result;
    }
}

module.exports = ExecutionChainData;