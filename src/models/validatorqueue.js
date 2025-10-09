const numeral = require('numeral');
class ValidatorQueue {
    constructor(partitionKey = null) {
        // data structure
        this.id = null;
        this.partitionKey = partitionKey;
        this.time = null;
        this.date = null;
        this.validators = null;
        this.entry_queue = null;
        this.entry_wait = null;
        this.exit_queue = null;
        this.exit_wait = null;
        this.churn = null;
        this.entry_churn = null;
        this.exit_churn = null;
        this.supply = null;
        this.staked_amount = null;
        this.staked_percent = null;
        this.apr = null;
    }

    AssignValues(data) {
        const assigned = [];
        const notAssigned = [];
        //const formattedOutput = {};
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
                assigned.push(key);
            } else {
                notAssigned.push(key);
            }
        }
        return { assigned, notAssigned};
    }

    ConvertToChartsArray(validatorQueueArr, startIndex = 0){
        var chartsArray = {
            date: [],
            validators: [],
            entry_queue: [],
            entry_wait: [],
            exit_queue: [],
            exit_wait: [],
            churn: [],
            entry_churn: [],
            exit_churn: [],
            supply: [],
            staked_amount: [],
            staked_percent: [],
            apr: []
        }

        const arrSize = validatorQueueArr.length;
        //console.log("ConvertToChartsArray | arrSize:", arrSize);
        if(startIndex < 0) startIndex = arrSize + startIndex;
        for (var d=startIndex;d<arrSize;d++){
            const day = validatorQueueArr[d];

            chartsArray.date.push(day.date);
            chartsArray.validators.push(day.validators);
            //chartsArray.validators.push(numeral(day.validators).format('0,0'));
            chartsArray.entry_queue.push(day.entry_queue);
            //chartsArray.entry_queue.push(numeral(day.entry_queue).format('0,0'));
            chartsArray.entry_wait.push(day.entry_wait);
            chartsArray.exit_queue.push(day.exit_queue);
            //chartsArray.exit_queue.push(numeral(day.exit_queue).format('0,0'));
            chartsArray.exit_wait.push(day.exit_wait);
            chartsArray.churn.push(day.churn);
            chartsArray.entry_churn.push(day.entry_churn);
            chartsArray.exit_churn.push(day.exit_churn);
            chartsArray.supply.push(day.supply);
            chartsArray.staked_amount.push(day.staked_amount);
            chartsArray.staked_percent.push(day.staked_percent);
            chartsArray.apr.push(day.apr);
        }
        return chartsArray;  
    }

    GetSnapshot(currentQueue, chain, listSchedule){
        //console.log("GetSnapshot",chain, currentQueue);
        if(!currentQueue) return {current: null, schedule: listSchedule, rangeIndex: null };

        const rangeResp = findRange(listSchedule, currentQueue.stateCount.active_ongoing?.validators);
        currentQueue.range = rangeResp.range;
        
        const entry_queue = (currentQueue?.stateCount?.pending_initialized?.validators ?? 0) + (currentQueue?.stateCount?.pending_queued?.validators ?? 0);
        const exit_queue = currentQueue?.stateCount?.active_exiting?.validators ?? 0;

        // calculate time
        currentQueue.activation = getState(entry_queue, currentQueue.range.churnEpoch, chain);
        currentQueue.exiting = getState(exit_queue, currentQueue.range.churnEpoch, chain);
        currentQueue.beaconchain_entering_hr = numeral(entry_queue).format('0,0');
        currentQueue.beaconchain_exiting_hr = numeral(exit_queue).format('0,0');
        currentQueue.validatorscount_hr = numeral(currentQueue.stateCount.active_ongoing.validators).format('0,0');
        return {current: currentQueue, schedule: listSchedule, rangeIndex: rangeResp.index};
    
        function findRange(listArr, value) { 
            const index = listArr.findIndex( range => value >= range.min && (range.max === null || value < range.max) );
            if (index === -1) return { range: null, index: -1 };
            return { range: listArr[index], index };
        }

        function getState(inQueue, churnEpochRate, chain){
            let secondsPerSlot, slotsPerEpoch;
            if(chain === "ethereum") {
                secondsPerSlot = 12;
                slotsPerEpoch = 32;
            } else if(chain === "gnosis"){
                // https://docs.gnosischain.com/about/specs/gbc/
                secondsPerSlot = 5;
                slotsPerEpoch = 16;
            }
            //console.log("chain:", chain, "→", secondsPerSlot, slotsPerEpoch);
            let obj = {};
            obj.rate_per_epoch = churnEpochRate;
            obj.waiting_time_epochs = inQueue / obj.rate_per_epoch;
            obj.waiting_time_seconds = obj.waiting_time_epochs * secondsPerSlot * slotsPerEpoch // 12 seconds per slot, 32 slots per epoch
            obj.waitingTimeMinutes = Math.floor(obj.waiting_time_seconds / 60);
            obj.waitingTimeHours = Math.floor(obj.waitingTimeMinutes / 60);
            // rounding
            obj.waiting_time_seconds = Math.round(obj.waiting_time_seconds % 60);
            obj.waitingTimeMinutes = Math.round(obj.waitingTimeMinutes % 60);

            return obj;
        }
    }
}

module.exports = ValidatorQueue;