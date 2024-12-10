class ExecutionChainData {
    constructor() {
        // data structure
        this.id = null;
        this.partitionKey = "gnosischain";
        this.day = null;
        this.timestamp = null;
        //this.date = null;
        this.totalSupply = null;
        this.marketCap = null;
        this.blockGasUsage = null;
        this.totalGasUsage = null;
       // this.burnedFees = null;
        this.dailyBlockCount = null;
        this.dailyTxRewards = null;
        this.blockTime = null;
        this.blockGasLimit = null;
        this.avgBlockUsage = null;
        this.transactions = null;
        this.pending_transactions = null;
    }

    ConvertToChartsArray(etherchainArr, startIndex = 0){
        //console.log(etherchainArr);
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
            //emission: [],
            //burnedFees: [],
            dailyBlockCount: [],
            dailyTxRewards: [],
            blockTime: [],
            blockGasLimit: [],
            avgBlockUsage: [],
            transactions: [],
            pending_transactions: []
        };

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
            //chartsArray.burnedFees.push(dayData.burnedFees);
            chartsArray.dailyBlockCount.push(dayData.dailyBlockCount);
            chartsArray.dailyTxRewards.push(dayData.dailyTxRewards);
            chartsArray.blockTime.push(dayData.blockTime);
            chartsArray.blockGasLimit.push(dayData.blockGasLimit);
            chartsArray.avgBlockUsage.push(dayData.avgBlockUsage);
            chartsArray.transactions.push(dayData.transactions);
            chartsArray.pending_transactions.push(dayData.pending_transactions);

            // calculations
           //chartsArray.emission.push(dayData.totalSupply - ((i === 0) ? 0 : etherchainArr[i - 1].totalSupply));
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