const numeral = require('numeral');
class EthStore {
    constructor() {
        // data structure
        this.id = null;
        this.partitionKey = "ethstore";
        this.day = null;
        this.date = null; // calculate
        this.apr = null;
        this.avgapr31d = null;
        this.avgapr7d = null;
        this.avgconsensus_rewards31d_wei = null;
        this.avgconsensus_rewards7d_wei = null;
        this.avgtx_fees31d_wei = null;
        this.avgtx_fees7d_wei = null;
        this.cl_apr = null;
        this.cl_avgapr31d = null;
        this.cl_avgapr7d = null;
        this.consensus_rewards_sum_wei = null;
        //this.day_end = null;
        //this.day_start = null;
        this.deposits_sum_wei = null;
        this.effective_balances_sum_wei = null;
        this.el_apr = null;
        this.el_avgapr31d = null;
        this.el_avgapr7d = null;
        this.end_balances_sum_wei = null;
        this.start_balances_sum_wei = null;
        this.total_rewards_wei = null;
        this.tx_fees_sum_wei = null;
    }

    AssignValues(data) {
        const assigned = [];
        const notAssigned = [];
        //const formattedOutput = {};
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
                assigned.push(key);
                //formattedOutput[key] = data[key];
            } else {
                notAssigned.push(key);
            }
        }
        return { assigned, notAssigned};
    }

    ConvertToChartsArray(ethStoreArr, startIndex = 0){
        var chartsArray = {
            day: [],
            apr: [],
            cl_apr: [],
            el_apr: [],
            avgapr31d: [],
            day_start: [],
            day_end: [],
            total_rewards_wei: [],
            cl_trprc: [],
            el_trprc: [],
            validators_count: []
        }

        const arrSize = ethStoreArr.length;
        if(startIndex < 0) startIndex = arrSize + startIndex;
        for (var d=startIndex;d<arrSize;d++){
            const day = ethStoreArr[d];
            //console.log(day);
            chartsArray.day.push(day.day);
            chartsArray.apr.push(day.apr * 100);
            chartsArray.cl_apr.push(day.cl_apr * 100);
            chartsArray.el_apr.push(day.el_apr * 100);
            chartsArray.avgapr31d.push(day.avgapr31d * 100);
            chartsArray.day_start.push(day.day_start);
            chartsArray.day_end.push(day.day_end);
            chartsArray.total_rewards_wei.push(day.total_rewards_wei);
            chartsArray.cl_trprc.push((day.cl_apr / day.apr) *100); // share on rewards
            chartsArray.el_trprc.push((day.el_apr / day.apr) *100); // share on rewards
        }
        return chartsArray;  
    }

    GetApr(defaultApr){
        return {
            value: numeral(defaultApr / 100).format('0.00%'),
            operator: numeral(defaultApr / 100).format('0.00%'),
            delegator: numeral(defaultApr * 0.9 / 100).format('0.00%')
        }          
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

module.exports = EthStore;