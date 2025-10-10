let validatorQueue = {
    ethereum: null,
    gnosis: null
};

function setValidatorQueue(chain, data){
    //console.log("setValidatorQueue", chain, data);
    validatorQueue[chain] = data;
}
function getValidatorQueue(chain){
    //console.log("getValidatorQueue", chain, "→", validatorQueue[chain]);
    const obj = validatorQueue[chain];

    const pending_initializedVal = (obj.stateCount.pending_initialized) ? obj.stateCount.pending_initialized.validators : 0;
    const pending_queuedVal = (obj.stateCount.pending_queued) ? obj.stateCount.pending_queued.validators : 0;
    if(!obj.stateCount.active_exiting) obj.stateCount.active_exiting = { validators: 0 };

    obj.help = { entryQueue: { validators: (pending_initializedVal + pending_queuedVal) } }
    obj.updatedOn = new Date(obj.time * 1000).toISOString();
    return obj;
}

module.exports = {
    setValidatorQueue,
    getValidatorQueue
};