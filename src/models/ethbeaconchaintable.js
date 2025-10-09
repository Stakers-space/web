class BeaconChainData {
    constructor() {
        // data structure
        this.id = null;
        this.partitionKey = "beaconchain";
        this.day = null;
        this.timestamp = null;
        this.validators = null;
        this.blocks = null;
        this.stakedEth = null;
        this.validatorBalance = null;
        this.networkLiveness = null;
        this.participationRate = null;
        this.stakeEffectiveness = null;
        this.deposits = null;
        this.withdrawals = null;
    }

    SetBlocks(proposed, missed, orphaned){
        this.blocks = {
            proposed: proposed,
            missed: missed,
            orphaned: orphaned
        }
    }

    SetDeposits(consensus, executionSucceed, executionFailed){
        this.deposits = {
            consensus: consensus,
            executionSucceed: executionSucceed,
            executionFailed: executionFailed
        }
    }

    ConvertToChartsArray(beaconchainArr, startIndex = 0){
        var chartsArray = {
            day:[],
            timestamp: [],
            date:[],
            validators: [],
            validators_change: [],
            blocks: [],
            stakedTokens: [],
            stakedTokens_change: [],
            validatorBalance: [],
            networkLiveness: [],
            participationRate: [],
            stakeEffectiveness: [],
            deposits: [],
            withdrawals: [],
            tvl:[], // filled later, from aggregation function
            tvl_change:[] // filled later, from aggregation function
        };

        if(!Array.isArray(beaconchainArr)){
            console.warn("Missing beaconchainArr data");
            return chartsArray;
        }

        const arrSize = beaconchainArr.length;
        if(startIndex < 0) startIndex = arrSize + startIndex;
        for(var i=startIndex;i<arrSize;i++){
            const dayData = beaconchainArr[i];
            chartsArray.day.push(dayData.day);
            chartsArray.timestamp.push(dayData.timestamp);
            chartsArray.validators.push(dayData.validators);
            chartsArray.blocks.push(dayData.blocks);
            chartsArray.stakedTokens.push(dayData.stakedEth);

            chartsArray.validatorBalance.push(dayData.validatorBalance);
            chartsArray.networkLiveness.push(dayData.networkLiveness);
            chartsArray.participationRate.push(dayData.participationRate);
            chartsArray.stakeEffectiveness.push(dayData.stakeEffectiveness);
            chartsArray.deposits.push(dayData.deposits);
            chartsArray.withdrawals.push(dayData.withdrawals);

            // calculations
            chartsArray.validators_change.push(dayData.validators - ((i === 0) ? 0 : beaconchainArr[i - 1].validators));
            chartsArray.stakedTokens_change.push(dayData.stakedEth - ((i === 0) ? 0 : beaconchainArr[i - 1].stakedEth));
            chartsArray.date.push(new Date(dayData.timestamp).toLocaleDateString('en-US'));
        }

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

module.exports = BeaconChainData;