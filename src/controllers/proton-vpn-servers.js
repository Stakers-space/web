
const cache = require('../middlewares/cache/cache-timestamps'),
    httpXmlModule = require('../utils/xmlhttps');

exports.GetServers = function(req,res){
    const now = new Date().getTime();
    let acceptedServers = {}; // countryCode:[Servers]
    if(now - cache.getSetProtonVpnCacheTimestamp() < 600000){
        // load from cache file

    } else {
        let filter = {
            whitelistedCountryCodes: ['CZ', 'SK', 'PL', 'AT', 'DE'],
            acceptedTiers: [1,2],
            maxLoad: 50,
        };
        for(countryCode of filter.whitelistedCountryCodes){ acceptedServers[countryCode] = []; }

        // recache and return
        new httpXmlModule().HttpsRequest({
            hostname: 'api.protonmail.ch',
            path: '/vpn/logicals',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }, null, function(err,jsonData){
            if(err){
                console.log(err);
            } else {
                const parsedResponse = JSON.parse(jsonData);
                const code = parsedResponse.Code;
                const servers = parsedResponse.LogicalServers,
                      servers_count = servers.length;
                console.log("api.protonmail.ch API | Returned servers:", servers_count);
                
                for(let i=0; i<servers_count; i++){
                    const server = servers[i];

                    if(!filter.acceptedTiers.includes(server.Tier)) continue; // free VPN servers
                    if(server.Load > filter.maxLoad) continue; // overloaded servers

                    if(filter.whitelistedCountryCodes.includes(server.EntryCountry)){
                        acceptedServers[server.EntryCountry].push(server);
                    }
                    // save to cache file
                }

                // Sort by Load value
                for (let countryCode in acceptedServers) { acceptedServers[countryCode].sort((a, b) => a.Load - b.Load); }
                console.log("Servers output:");
                for(countryCode of filter.whitelistedCountryCodes){ 
                    console.log(countryCode, acceptedServers[countryCode].length, acceptedServers[countryCode]);
                }
            }
        });
    }
    
    if(res) res.send("Under construction");
}