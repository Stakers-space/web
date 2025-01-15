
let cacheTimestamps = {
    protonVpnServers: 0
};

function getSetProtonVpnCacheTimestamp(timestamp){
    if(timestamp) cacheTimestamps.protonVpnServers = timestamp;
    return cacheTimestamps.protonVpnServers;
}

module.exports = {
    getSetProtonVpnCacheTimestamp
};