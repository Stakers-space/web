let clockSync = {};

function setServerClockSync(serverId, status){
    clockSync[serverId] = status;
}

function getServerClockSync(serverId){
    return clockSync[serverId];
}

module.exports = {
    setServerClockSync,
    getServerClockSync
};