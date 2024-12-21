
"use strict";

const mySqlCredentials = require('../config/config.secret.json').mysql;
const mySql = require('mysql');

function MySqlDBplatform(){ 
    /*this.pool = mySql.createPool({
        connectionLimit : 3,
        host            : mySqlCredentials.host,
        user            : mySqlCredentials.user,
        password        : mySqlCredentials.pass,
        database        : mySqlCredentials.database
    });*/
}
/**
 * Set new password for the user
 * @param {*} email 
 * @param {*} psw 
 * @param {*} salt 
 * @param {*} cb 
 */

MySqlDBplatform.prototype.GetAccountData = function(email, cb){
    //console.log("MySQL Service | Get account data:", email);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM accounts WHERE email = '+MC.escape(email)+' LIMIT 1',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.GetAccountContact = function(accountId, cb){
    //console.log("MySQL Service | Get account data:", email);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT `email`,`email_subscriptions`,`email_alerts`, `api_token` FROM accounts WHERE id = '+MC.escape(accountId)+' LIMIT 1',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.GetAccountsForInstances = function(instanceIds_arr, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT i.id AS instance_id, a.id AS account_id, a.email, a.email_subscriptions, a.email_alerts '+
             'FROM stakersspace.instances i JOIN stakersspace.accounts a ON i.owner = a.id '+
             'WHERE i.id IN ('+MC.escape(instanceIds_arr)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.UpdatePasswordResetToken = function(email, token, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE accounts SET psw_token = '+MC.escape(token)+', psw_token_time = CURRENT_TIMESTAMP() WHERE email = '+MC.escape(email),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.UpdateUserPassword = function(email, psw, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE `accounts` SET psw_hash = '+MC.escape(psw)+' WHERE email = '+MC.escape(email),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.AddUserAccount = function(email, token, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT IGNORE INTO `accounts` (email, psw_token, psw_token_time) VALUES ('+MC.escape(email)+','+MC.escape(token)+', CURRENT_TIMESTAMP())',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.AddServer = function(ownerId, serverData, cb){
    console.log("MySQL service | AddServer", ownerId, serverData);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT INTO `servers` (owner, name) VALUES (?, ?)', [ownerId, serverData.serverName], 
        function(err, result) {
            MC.end();
            //console.log("MySQL service | AddServer response", result);
            return cb(err, result);
    });
};

MySqlDBplatform.prototype.UpdateServer = function(serverId, ownerId, serverData, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE servers SET name = ?, location = ?, location_note = ?, ip_network = ?, cpu_type = ?, server_user = ?, ssh_port = ?, operation_start = ?, vpn_id = ?, vpn_expiration = ?, nodejs_ver = ?, jdk_ver = ?, id = LAST_INSERT_ID(id) WHERE `id` = ? AND owner = ?',  [serverData.serverName, serverData.serverLocation, serverData.serverLocation_note, serverData.serverNetwork, serverData.serverCpu, serverData.serverUser, serverData.sshPort, serverData.operationStart, serverData.vpnId, serverData.vpnExpiration, serverData.nodejsVer, serverData.jdkVer, serverId, ownerId], function(err, result) {
        MC.end();
        return cb(err, result);
    });
};

MySqlDBplatform.prototype.UpdateLoginMark = function(serverId, ownerId, loginStatus, cb){
    let status = 0; // unknown
    switch(loginStatus){
        case 'success-ssh':
            status = 1;
            break;
        case 'success-local':
            status = 2;
            break;
        case 'failure':
            status = 3;
            break;
        case 'failure-password':
            status = 4;
            break;
    };

    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE servers SET last_login_state = ?, last_login_time = ? WHERE `id` = ? AND owner = ?',  [status, new Date(), serverId, ownerId], function(err, result) {
        MC.end();
        return cb(err, result);
    });
}

MySqlDBplatform.prototype.AttachClientToServer = function(serverId, layer, clientsData, cb){
    let taskResults = [];
    let scheduledtasks = clientsData.length;
    console.log("AttachClientToServer", serverId, layer, clientsData, "scheduledTasks:", scheduledtasks);
    if(scheduledtasks === 0)  return cb(null, taskResults);
   
    var MC = mySql.createConnection(mySqlCredentials);
    for (const data of clientsData){  // for loop in async process?
        // Get List of clients on the server
        MC.query('SELECT * FROM `servers_clients` WHERE `server_id`='+MC.escape(serverId)+' AND `layer` = '+MC.escape(layer)+' ORDER BY id LIMIT 5',
            function(err,rows) {
                if(err) { MC.end(); return cb(err, rows); }

                // Compare definition in data to db result
                let clientId = null;

                // Update or insert new mark
                if(rows.length === 0){
                    // Insert new mark
                    MC.query('INSERT INTO `servers_clients` (server_id, layer, client, ver) VALUES ('+MC.escape(serverId)+','+MC.escape(layer)+','+MC.escape(data.client)+','+MC.escape(data.ver)+')', 
                        function(err,result) {
                            if(err) { MC.end(); return cb(err, result); }
                            OnTaskCompleted(result);
                        }
                    );
                } else {
                    // update all marks (there is only 1 mark supported currently)
                    clientId = rows[0].id;
                    MC.query('UPDATE `servers_clients` SET client = '+MC.escape(data.client)+', ver = '+MC.escape(data.ver)+', id = LAST_INSERT_ID(id) WHERE `id` = '+MC.escape(clientId),
                        function(err, result) {
                            if(err) { MC.end(); return cb(err, result); }
                            OnTaskCompleted(result);
                    });
                }
            }
        );
    }

    function OnTaskCompleted(taskResult){
        taskResults.push(taskResult);
        scheduledtasks--;
        console.log("AttachClientToServer |",layer,"| OnTaskCompleted | remainingTasks:", scheduledtasks);
        if(scheduledtasks === 0){
            MC.end();
            return cb(null, taskResults);
        }
    }
};

MySqlDBplatform.prototype.AttachPortsToClient = function(clientresults, clientsData, cb){
    let taskResults = [];
    const clientResultsL = clientresults.length;
    if(clientResultsL === 0) return cb(null, taskResults);
    let scheduledTasks = 1;
    const clientId = clientresults[0].insertId; // same for all indexes, as it applyes for a single server
    var MC = mySql.createConnection(mySqlCredentials);

    MC.query('DELETE FROM `clients_ports` WHERE `client_id` = '+MC.escape(clientId), function(err, results) {
        if (err) { MC.end(); return cb(err, results); }
        for(var i=0;i<clientResultsL;i++){
            const ports = clientsData[i].ports;
            if(ports.length === 0){
                MC.end();
                return cb(null, taskResults);
            }
            for(const port of ports){
                //console.log("AttachPortsToClient | Attaching port", port);
                scheduledTasks++;
                const query = '`clients_ports` (client_id, chain, service_name, port, port_p2p, port_p2pd, port_2, data_path) VALUES ('+MC.escape(clientId)+','+MC.escape(port.chain)+','+MC.escape(port.service_name)+','+MC.escape(port.port)+','+MC.escape(port.p2p_port)+','+MC.escape(port.p2p_discovery_port)+','+MC.escape(port.port_2)+','+MC.escape(port.data_path)+')'
                //console.log(query);
                MC.query('INSERT INTO '+query, function(err, results) {
                    if (err) { MC.end(); return cb(err, results); }
                    OnTaskCompleted(results); 
                });
            }
        }
        scheduledTasks--; // starts with value 1 → clearing
    });

    // for query
    function OnTaskCompleted(taskResult){
        taskResults.push(taskResult);
        scheduledTasks--;
        if(scheduledTasks === 0){
            MC.end();
            return cb(null, taskResults);
        }
    }
}


MySqlDBplatform.prototype.AttachUserAccessToServer = function(accountId, serverId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT IGNORE INTO `servers_access` (server_id, account_id) VALUES ('+MC.escape(serverId)+','+MC.escape(accountId)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.GetOwnedServers = function(ownerId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT `id`,`name`, `last_login_time`, `last_login_state` FROM `servers` WHERE owner = '+MC.escape(ownerId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.GetOwnedServersWithAttachedInstances = function(userId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query(`SELECT 
    s.id AS sid,
    i.id AS instance_id, 
    s.*, 
    sc.id AS cid, sc.*,
    i.chain AS ichain, i.*,
	p.*
    FROM stakersspace.servers s
    LEFT JOIN stakersspace.servers_clients sc ON s.id = sc.server_id
    LEFT JOIN stakersspace.instances i ON s.id = i.server_id
    LEFT JOIN stakersspace.clients_ports p ON sc.id = p.client_id
    WHERE s.id IS NOT NULL AND s.owner =`+MC.escape(userId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

// User should has access to all servers its validator instance running on
/* unused
MySqlDBplatform.prototype.GetServersForAccount = function(accountId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT s.*, sc.*, a.brand_name, a.brand_link '+
             'FROM stakersspace.servers_access sa '+
             'JOIN stakersspace.servers s ON sa.server_id = s.id '+
             'LEFT JOIN stakersspace.servers_clients sc ON sc.server_id = s.id '+
             'JOIN stakersspace.accounts a ON a.id = s.owner '+
             'WHERE sa.account_id = '+MC.escape(accountId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};*/

/* Unused
MySqlDBplatform.prototype.GetServersByIds = function(serverIdsArr, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT s.*, a.brand_name, a.brand_link '+
             'FROM servers s '+
             'JOIN accounts a ON s.owner = a.id '+
             'WHERE s.id IN ('+MC.escape(serverIdsArr)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};*/


// Remake - based on `instances_access`
MySqlDBplatform.prototype.GetValidatorsForAccount  = function(accountId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT i.* FROM instances i WHERE i.id IN (SELECT ia.instance_id FROM instances_access ia WHERE ia.account_id = '+MC.escape(accountId)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetAccountsWithAccessToInstance  = function(instanceId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT a.* FROM stakersspace.instances_access ia JOIN stakersspace.accounts a ON ia.account_id = a.id WHERE ia.instance_id = '+MC.escape(instanceId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetServerInfo  = function(serverId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM `servers` WHERE id = '+MC.escape(serverId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetServerClientsInfo  = function(serverId, cb){    
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query(`SELECT s.*, sc.*, cp.*
        FROM stakersspace.servers s
        LEFT JOIN stakersspace.servers_clients sc ON s.id = sc.server_id
        LEFT JOIN stakersspace.clients_ports cp ON sc.id = cp.client_id
        WHERE s.id = `+MC.escape(serverId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetClientsPorts  = function(clientIds, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM clients_ports WHERE client_id IN ('+MC.escape(clientIds)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetServerActions  = function(serverId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM `servers_actions` WHERE `server_id`='+MC.escape(serverId)+' ORDER BY id DESC LIMIT 20',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetServersClientsInfo  = function(serverIds, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT s.id AS sid, s.*, a.brand_name, a.brand_link, sc.* '+ // use sid instead od server_id as server_id is dependednt on attached clients
             'FROM stakersspace.servers s '+
             'JOIN stakersspace.accounts a ON s.owner = a.id '+
             'LEFT JOIN stakersspace.servers_clients sc ON s.id = sc.server_id '+
             'WHERE s.id IN ('+MC.escape(serverIds)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.GetValidatorInstance  = function(instanceId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM `instances` WHERE id = '+MC.escape(instanceId)+' LIMIT 1',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};

MySqlDBplatform.prototype.AddValidatorInstance  = function(ownerId, serverId, instanceData, cb){
    //console.log("MySQL service | AddValidatorInstance", ownerId, serverId, instanceData);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT INTO `instances` (owner, instance, server_id, vi_pid) VALUES (?, ?, ?, ?)', [ownerId, instanceData.instance, serverId, instanceData.vi_pid], 
        function(err, result) {
            MC.end();
            return cb(err, result);
    });
};

MySqlDBplatform.prototype.UpdateValidatorInstance = function(instanceId, userId, serverId, instanceData, cb){
    console.log("MySQL service | UpdateValidatorInstance", instanceId, userId, serverId, instanceData);
    var MC = mySql.createConnection(mySqlCredentials);
    //  AND owner = protection from writing by different user
    MC.query('UPDATE `instances` SET instance = ?, note = ?, server_id = ?, fee_recipient = ?, vi_sname = ?, vi_suser = ?, vi_sdata = ?, id = LAST_INSERT_ID(id) WHERE `id` = ? AND owner = ?',  
        [instanceData.instance, instanceData.note, serverId, instanceData.fee_recipient, instanceData.vi_sname, instanceData.vi_suser, instanceData.vi_sdata, instanceId, userId], function(err, result) {
            MC.end();
            return cb(err, result);
    });
};

MySqlDBplatform.prototype.UpdateValidatorInstance_Data = function(instanceId, userId = 0, data, chain, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    if(userId === 0){ // from Server API
        MC.query('UPDATE `instances` SET data = ?, id = LAST_INSERT_ID(id) WHERE `id` = ?', [data, instanceId], function(err, result) {
            MC.end();
            return cb(err, result);
        });
    } else { // from mserver dashboard
        //  AND owner = protection from writing by different user
        MC.query('UPDATE `instances` SET data = ?, chain = ?, id = LAST_INSERT_ID(id) WHERE `id` = ? AND owner = ?', [data, chain, instanceId, userId], function(err, result) {
            MC.end();
            return cb(err, result);
        });
    }
};

MySqlDBplatform.prototype.AttachUserAccessToValidatorInstance = function(accountId, instanceId, cb){
    //console.log("MySQL service | AttachUserAccessToValidatorInstance", accountId, instanceId);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT IGNORE INTO `instances_access` (instance_id, account_id) VALUES ('+MC.escape(instanceId)+','+MC.escape(accountId)+')',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.AddServerAction  = function(serverId, action, cb){
    //console.log("MySQL service | AddValidatorInstance", ownerId, serverId, instanceData);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('INSERT INTO `servers_actions` (server_id, action) VALUES (?, ?)', [serverId, action], 
        function(err, result) {
            MC.end();
            return cb(err, result);
    });
};

MySqlDBplatform.prototype.UpdateServerNote = function(serverId, ownerId, note, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE `servers` SET note = '+MC.escape(note)+' WHERE id = '+MC.escape(serverId)+' AND owner = '+MC.escape(ownerId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.UpdateServerIdForInstance = function(instanceId, currentServerId, newServerId, accountId, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('UPDATE `instances` SET server_id = '+MC.escape(newServerId)+' WHERE id = '+MC.escape(instanceId)+' AND server_id = '+MC.escape(currentServerId)+' AND owner = '+MC.escape(accountId),
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.UpdateClientsRecommendations = function(clients, serverId){
    // sdd service
    clients.executionLayer.nethermind.latestVer = clients.executionLayer.nethermind.latestVer.split("-")[0];
    const e = clients.executionLayer,
          c = clients.consensusLayer,
          m = clients.mevLayer,
          s = clients.serviceLayer;
    var MC = mySql.createConnection(mySqlCredentials);

    const generateCaseForLayerAndClient = (layer, clients) => {
        let cases = '';
        for (const client in clients) {
            const clientData = clients[client];
            cases += `
                WHEN layer = ${MC.escape(layer)} AND client = ${MC.escape(clientData.name.toLowerCase())} AND ver = ${MC.escape(clientData.latestVer)} AND rcm != '' 
                THEN ''
                WHEN layer = ${MC.escape(layer)} AND client = ${MC.escape(clientData.name.toLowerCase())} AND ver != ${MC.escape(clientData.latestVer)} 
                THEN CONCAT('Latest client ver: ', ${MC.escape(clientData.latestVer)})
            `;
        }
        return cases;
    };

    let whereQuery = serverId ? `server_id = ${MC.escape(serverId)}` : '1=1';

    let query = `
        UPDATE servers_clients
        SET 
            rcm = CASE 
                      ${generateCaseForLayerAndClient('execution', e)}
                      ${generateCaseForLayerAndClient('consensus', c)}
                      ${generateCaseForLayerAndClient('mev', m)}
                      ${generateCaseForLayerAndClient('service', s)}
                      ELSE rcm
                  END
        WHERE ${whereQuery}`;

    MC.query(query, function(err, results) {
        if (err) {
            MC.end();
            return console.error(err);
        }

        console.log('UpdateClientsRecommendations | Updated rows:', results.affectedRows);

        MC.end();
    });
};


MySqlDBplatform.prototype.GetApiCredentials = function(user_id, cb){
    //console.log("MySQL Service | Get account data:", email);
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT `api_token` FROM accounts WHERE id = '+MC.escape(user_id)+' LIMIT 1',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
	    }
    );
};

MySqlDBplatform.prototype.Api_PushResourcesData = function(account_id, server_id, api_token, disk_usage, ram_usage, swap_usage, vpn_status, vpn_connection, cl_peers, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query( `SELECT 
        a.id,
        a.api_token, 
        a.email_subscriptions, 
        a.email_alerts,
        s.id AS server_id, 
        IF(s.id IS NOT NULL, TRUE, FALSE) AS is_owner,
        (
            SELECT COUNT(*) 
            FROM stakersspace.server_resources sr 
            WHERE sr.account_id = a.id AND sr.server_id = s.id
        ) AS resource_count
    FROM stakersspace.accounts a
    LEFT JOIN stakersspace.servers s ON s.owner = a.id AND s.id = `+MC.escape(server_id)+
    `WHERE a.id = `+MC.escape(account_id),
        function(err,rows) {
            if(err || rows.length === 0){
                MC.end();
                if(!err) err = "No results";
                return cb(err, null);
            } 

            if(api_token !== rows[0].api_token || rows[0].is_owner === 0){
                MC.end();
                err = (api_token !== rows[0].api_token === 0) ? "Api token does not match" : "Account is not server owner";
                return cb(err, null);
            }

            let query = null;
            if(rows[0].resource_count < 50){
                // INSERT
                query = 'INSERT INTO server_resources (server_id, account_id, disk_usage, ram_usage, swap_usage, timestamp, vpn, vpn_server, beacon_peers) '+
                        'VALUES ('+MC.escape(server_id)+','+MC.escape(account_id)+', '+MC.escape(disk_usage)+', '+MC.escape(ram_usage)+', '+MC.escape(swap_usage)+', NOW(), '+MC.escape(vpn_status)+', '+MC.escape(vpn_connection)+', '+MC.escape(cl_peers)+')';
            } else {
                // update
                query = 'UPDATE server_resources'+
                        ' SET disk_usage = '+MC.escape(disk_usage)+', ram_usage = '+MC.escape(ram_usage)+', swap_usage = '+MC.escape(swap_usage)+', timestamp = NOW(), vpn = '+MC.escape(vpn_status)+', vpn_server='+MC.escape(vpn_connection)+', beacon_peers='+MC.escape(cl_peers)+
                        ' WHERE server_id = '+MC.escape(server_id)+' AND account_id = '+MC.escape(account_id)+
                        ' ORDER BY timestamp ASC'+
                        ' LIMIT 1';
            }
            MC.query(query, function(err) {
                MC.end();
                return cb(err, rows);
            });
	    }
    );
}
MySqlDBplatform.prototype.GetServersResourcesData = function(account_id, cb){
    var MC = mySql.createConnection(mySqlCredentials);
    MC.query('SELECT * FROM server_resources WHERE account_id = '+MC.escape(account_id)+' ORDER BY timestamp',
        function(err,rows) {
            MC.end();
            return cb(err, rows);
        }
    );
};


module.exports = MySqlDBplatform;