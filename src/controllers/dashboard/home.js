
const mysqlSrv = require('../../services/mysqlDB');

const cache = require('../../middlewares/cache');

exports.Dashboard = (req,res,next) => {
	res.locals.hbs = "home";
    const user = req.user;

    if(user.role === 'admin'){
        res.locals.adminPanel = `<div class="gap-4 text-center mb-10">
            <h2 class="mt-10 mb-5 text-2xl font-semibold">Admin panel</h2>
            <div>
                <a href="/dashboard/admin/news" class="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">News management</a>
                <a href="/dashboard/admin/clients" class="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">Clients management</a>
            </div>
        </div>`;
    };
    // Get Servers the user has access to
    const mysqlInst = new mysqlSrv();
    // get servers under management
    let scheduledTasks = 2;
    let ownedServersIdsArray = [],
        lastLoginOnServer = {},
        instances_arr = [];

    mysqlInst.GetOwnedServers(user.id, function(err, owned_servers){
        if(err){ res.locals.err = err; next(); }
        for(const server of owned_servers){ 
            ownedServersIdsArray.push(server.id); 
            lastLoginOnServer[server.id] = {
                time: server.last_login_time,
                state: server.last_login_state,
                color: (server.last_login_state <= 2) ? 'green' : 'red'
            };
        }
        OnTaskCompleted();
    });

    // Get data from validator instances
    mysqlInst.GetValidatorsForAccount(user.id, function(err, data_instances){
        if(err){ res.locals.err = err; next(); }
        instances_arr = data_instances;
        res.locals.lastEpochReported = cache.getLastEpochReported(); // last epoch reported
        res.locals.lastEpocSyncState = cache.getSetValidatorsStateSynced(); // last epoch is up to date
        OnTaskCompleted();
    });

    function OnTaskCompleted(){
        scheduledTasks--;
        if(scheduledTasks > 0) return;

        const instances_arr_count = instances_arr.length;
        
        //console.log(`Instances under account ${user.id}: `, instances_arr_count);
        res.locals.offlineStateInfo = '<span style="color:grey">No validators are being tracked.</span>';
        res.locals.offlineStateData = "";
        if(instances_arr_count === 0 && ownedServersIdsArray.length === 0){
            res.locals.servers = {};
            return next();
        }
        // ------------------- Servers load required ---------------------------
        
        // servers list
        let serversIds = [];
        let accountInstances = [];
        for(var a=0;a<instances_arr_count;a++){
            serversIds.push(instances_arr[a].server_id);
            accountInstances.push(instances_arr[a].id);
            instances_arr[a].isOwner = (instances_arr[a].owner === user.id).toString();
        }
        res.locals.instances = instances_arr;
        
        let mergedServersArr = serversIds.concat(ownedServersIdsArray);
        let serversIdsList = Array.from(new Set(mergedServersArr));
        serversIdsList.sort((a, b) => a - b);

        //console.log("serversIdsList", serversIdsList);
        if(accountInstances.length > 0){
            let offlineValidatorsByInstances = cache.getOfflineState(accountInstances);
            //console.log("cache.getOfflineState", offlineValidatorsByInstances);
            if(Object.keys(offlineValidatorsByInstances).length === 0) {
                res.locals.offlineStateInfo = '<span style="color:green">All validators online</span>';
            } else {
                res.locals.offlineStateInfo = '<span style="color:orange">⚠️</span>';
            }
            res.locals.offlineStateData = JSON.stringify(offlineValidatorsByInstances);
        }
        
        //console.log("GetServersInfo:", serversIdsList);
        mysqlInst.GetServersClientsInfo(serversIdsList, function(err,servers_clients){
            if(err){ res.locals.err = err; next(); }

            //console.log("data_servers_clients:", servers_clients);

            // aggregate servers by location
            let locations = {};
            const servers = new Map();

            const servers_clientsL = servers_clients.length;
            for(var i=0;i<servers_clientsL;i++){ 
                let row = servers_clients[i];
                const server_id = row.sid;
                let serverData = null;
                
                // aggregate clients by server
                if(!servers.has(server_id)) {
                    // First server occurance
                    // attach information whether is owner or not
                    // ToDo: instead of .isOwner - hasAccess should be checked
                    row.isOwner = (row.owner === user.id).toString();

                    // attach instances (should be optimized)
                    row.instances = [];
                    for(var a=0;a<instances_arr_count;a++){
                        if(instances_arr[a].server_id === row.sid) row.instances.push(instances_arr[a]);
                    }
                    serverData = row;
                } else {
                    // Extend server for new client
                    serverData = servers.get(server_id);
                }

                // extend for server clients
                if(!serverData.cliensList) serverData.cliensList = [];
                serverData.cliensList.push({ 
                    client: row.client,
                    ver: row.ver,
                    rcm: row.rcm
                });
                serverData.login = lastLoginOnServer[server_id];

                servers.set(server_id, serverData);
            }

            // aggregate servers by location
            for (const server_data of servers.values()) {
                //console.log(server_data);
                const serverLocation = (server_data.location) ? server_data.location : "Unknown";
                
                if(!locations[serverLocation]) {
                    locations[serverLocation] = {servers:[]};
                    locations[serverLocation].location = serverLocation;
                    locations[serverLocation].network = server_data.ip_network; 
                }
                locations[serverLocation].servers.push(server_data); // aggregate by location
            }
            res.locals.servers = locations;
            /*console.log("Servers", res.locals.servers);*/
            //console.log("Work Servers", res.locals.servers["Work"]);
            next();
        });
    }
};

exports.Notifications = (req,res,next) => {
    res.locals.hbs = "notifications";
    next();
};

exports.GetDecryptedUserData = function(req,res,next){
    // Get decrypted 'data' for all instances assocaited with the user
};