let lastEpochReported = null;
let offlineStates = {};
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

function setLastEpochReported(value) { lastEpochReported = value; }
function setOfflineStates(data){ offlineStates = data; console.log("cached offline states:", offlineStates); }
function setLastReportSent(accountId, timestamp){ lastReportSent[accountId] = timestamp; }


function addPubkeystoQueue(chain, instanceId,pubkeys,indexes,password, activateMonitoring=false){
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

module.exports = {
    getLastEpochReported,
    setLastEpochReported,
    getOfflineState,
    setOfflineStates,
    getLastReportSent,
    setLastReportSent,
    addPubkeystoQueue,
    getPubkeyFromQueue,
    getOfflineStatesAlertType
};