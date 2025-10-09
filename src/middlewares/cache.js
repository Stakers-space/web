function ChainsList(defaultvalue){
    this.ethereum = defaultvalue;
    this.gnosis = defaultvalue;
}

let lastEpochReported = new ChainsList(0);
let offlineStates = {}; // chain is not needed as is based on instance id
/**
 * {
    '1': { v: 3, o: [ [Object], [Object] ] },
    '2': { v: 5, o: [ [Object], [Object], [Object] ] }
 }
 */
let lastReportSent = {};
let pubkeysQueue = {
    gnosis: {},
    ethereum: {}
};

/**
 * Track whether the app has up to date data about validator states
 */
let validatorsStateSynced = new ChainsList(true);

function getLastEpochReported() { return lastEpochReported; }
function getOfflineState(instanceIds){ 
    let stateSnap = {};
    for(const instanceId of instanceIds){ 
        if(offlineStates[instanceId]) {
            //console.log(instanceId, "→", offlineStates[instanceId]);
            stateSnap[instanceId] = offlineStates[instanceId];
        }
    }
    //if(process.env.PORT !== undefined) console.log("get cached states for instances:", instanceIds, "→", stateSnap);
    return stateSnap;
}
function getOfflineStatesAlertType(){
    let notifyState = 0; // 0 = no notification | 1 = standard notification | 2 = critical notification
    for (const key of Object.keys(offlineStates)) {
        const offlinePercentage = offlineStates[key].o.length / offlineStates[key].v;
        
        if(offlinePercentage > 0.05) { // instance is offline
            notifyState = 1;
            console.log(`instance ${key}: offlinePercentage: ${offlinePercentage} | ${offlineStates[key].o.length}/${offlineStates[key].v}`);
            if(offlinePercentage > 0.3) {
                notifyState = 2;
                break;
            }
        }
    };
    return notifyState;
}

function getLastReportSent(accountId){
    return (lastReportSent[accountId]) ? lastReportSent : 0;
}
/**
 * Set epoch number of last snapshot
 * @param {*} chain 
 * @param {*} value 
 */
function updateLastEpochReported(chain, value) { lastEpochReported[chain] = value; }


function updateOfflineStates(data){ 
    // chain not needed as is based on instance id
    // iterate and update offline states
    offlineStates = data;
    //if(Object.keys(offlineStates).length > 0) console.log("cached offline states:", offlineStates); 
    
}
function setLastReportSent(accountId, timestamp){ lastReportSent[accountId] = timestamp; }

function updatePubkeystoQueue(chain, instanceId,pubkeys,indexes,password, activateMonitoring=false){
    console.log("updatePubkeystoQueue | instance:", instanceId, chain, "| activeMonitoring:", activateMonitoring);
    pubkeysQueue[chain][instanceId] = {
        iid:instanceId,
        keys:pubkeys,
        indexes:indexes,
        psw:password,
        monitor:activateMonitoring
    }
}

function getPubkeyFromQueue(chain){
    const instancesArr = Object.keys(pubkeysQueue[chain]);
    if(instancesArr.length > 0){
        const firstInstance = instancesArr[0];
        let data = pubkeysQueue[chain][firstInstance];
        delete pubkeysQueue[chain][firstInstance];
        return data;
    }
    return null;
}

function getSetValidatorsStateSynced(chain = null, state = null){
    if(state && chain) validatorsStateSynced[chain] = state;
    return validatorsStateSynced;
}

module.exports = {
    getLastEpochReported,
    updateLastEpochReported,
    getOfflineState,
    updateOfflineStates,
    getLastReportSent,
    setLastReportSent,
    updatePubkeystoQueue,
    getPubkeyFromQueue,
    getOfflineStatesAlertType,
    getSetValidatorsStateSynced
};