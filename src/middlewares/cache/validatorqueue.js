let validatorQueue = {
    ethereum: null,
    gnosis: null
};

function setValidatorQueue(chain, data){
    validatorQueue[chain] = data;
}
function getValidatorQueue(chain){
    return validatorQueue[chain];
}

module.exports = {
    setValidatorQueue,
    getValidatorQueue
};