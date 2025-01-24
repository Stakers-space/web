let lastEpochReported = { gnosis: 0, ethereum: 0 };
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
let validatorsStateSynced = true;

function getLastEpochReported() { return lastEpochReported; }
function getOfflineState(instanceIds){ 
    let stateSnap = {};
    for(const instanceId of instanceIds){ 
        if(offlineStates[instanceId]) {
            console.log(instanceId, "→", offlineStates[instanceId]);
            stateSnap[instanceId] = offlineStates[instanceId];
        }
    }
    if(process.env.PORT !== undefined) console.log("get cached states for instances:", instanceIds, "→", stateSnap);
    return stateSnap;
}
function getOfflineStatesAlertType(){
    let length = 0;
    let isCritical = false;
    Object.keys(offlineStates).forEach((key) => {
        if(offlineStates[key].o.length > 30) length++; // instance is offline
        if(offlineStates[key].o.length > 100) isCritical = true; // instance is offline
    });

    let notify = 0;
    if(length > 0) notify = (isCritical) ? 2 : 1;
    return notify;
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
    if(Object.keys(offlineStates).length > 0) console.log("cached offline states:", offlineStates); 
    
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
    const firstKey = Object.keys(pubkeysQueue[chain])[0];
    const firstValue = pubkeysQueue[chain][firstKey];
    delete pubkeysQueue[chain][firstKey];
    return firstValue;
}

function getSetValidatorsStateSynced(state = null){
    if(state) validatorsStateSynced = state;
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