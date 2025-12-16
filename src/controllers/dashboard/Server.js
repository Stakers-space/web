const mysqlSrv = require('../../services/mysqlDB');
const ServerModel = require('../../models/dashboard/server');

//const sanitizeHtml = require('sanitize-html');
//const cache = require('../../middlewares/cache');

const fs = require('fs'),
    path = require('path');
const clientsFile = path.join(__dirname, '..', '..', '..', 'data/clients.json');

// Render page
exports.DefineServer = (req, res, next) => {
    res.locals.hbs = "manageServer";
    res.locals.formTitle = "Add Server Node";
    res.locals.formSubmit = "Add Server";
    res.locals.submitLink = "/dashboard/define";
    res.locals.server = new ServerModel();
    const serverId = req.query.id;
    res.locals.isOwner = true;
    
    if(!serverId) return next(); // Define new Server

    res.locals.editingView = true;
    
    // Dashboard for checking Server data and updating them
    
    res.locals.formTitle = "Edit Server Node"
    res.locals.formSubmit = "Update Server";
    res.locals.submitLink = "/dashboard/define?sid="+serverId;
    res.locals.submitNoteLink = '/dashboard/edit-server-note?sid='+serverId;
    //console.log("Edit ServerId ", req.query.id);
    // Get Server data
    let accessibleServerIds = [];
    let scheduledTasks = 5;
    const mysqlInst = new mysqlSrv();
    // fet API credentials info
    mysqlInst.GetAccountContact(req.user.id, function(err, accountData){
        if(err) { res.locals.err = err; return next(); }
        //console.log("accountData:", accountData);
        if(accountData.length > 0) res.locals.account = {
            id: req.user.id,
            api_token: accountData[0].api_token
        };
        OnTaskCompleted();
    });
    
    // allow common users to access servers where they have an instance
    mysqlInst.GetValidatorsForAccount(req.user.id, function(err, data_instances){
        if(err){ res.locals.err = err; next(); }
        //console.log("GetValidatorsForAccount:", data_instances);
        for(var a=0;a<data_instances.length;a++){ accessibleServerIds.push(data_instances[a].server_id); }
        OnTaskCompleted();
    });

    mysqlInst.GetServerClientsInfo(serverId, function(err, data){
        if(err) { res.locals.err = err; return next(); }
        let dbResults = data.length;
        if(dbResults === 0){ res.locals.err = "Unauthorized access"; return next(); }

            res.locals.isOwner = data[0].owner === req.user.id;
            let serverObj = new ServerModel();
            serverObj.GenerateFromMySqlStructure(data);
            serverObj.GetDefinedChains();
            serverObj.AggregatePortsbyChain();
            serverObj.ConvertServicesToObject();
            serverObj.id = serverId;
            //console.log(data,"→",serverObj, serverObj.mev);
            if(res.locals.isOwner) {
                serverObj.AddNote(data[0].note);
                accessibleServerIds.push(serverId);
            }
            /*console.log(serverObj, "PortsByChain | e:",serverObj.portsByChain.execution, "c:",serverObj.portsByChain.consensus);
            try {
                console.log("serverObj.consensus[0].ports", serverObj.consensus[0].ports, "serverObj.execution[0].ports:", serverObj.execution[0].ports);
            } catch(e){console.error(e);}*/
            res.locals.server = serverObj;
            OnTaskCompleted();
    });

    // individual
    mysqlInst.GetServerActions(serverId, function(err,actions){
        if(err) { res.locals.err = err; return next(); }
        res.locals.actions = actions;
        OnTaskCompleted();
    });

    // load client versions
    fs.readFile(clientsFile, 'utf8', (err, data) => { 
        if(err) { res.locals.err = err; return next(); }
        res.locals.clients = JSON.stringify(JSON.parse(data));
        //console.log(res.locals.clients);
        OnTaskCompleted();
    });

    // Get Server-clients data yet

    function OnTaskCompleted(){
        scheduledTasks--;
        if(scheduledTasks===0) {
            //console.log("accessibleServerIds:",accessibleServerIds, serverId);
            if(!res.locals.isOwner && !accessibleServerIds.includes(Number(serverId))) { res.locals.err = "Unauthorized access"; return next(); }
            /*console.log("execution:", res.locals.server.execution, res.locals.server.execution[0].ports);
            console.log("consensus:", res.locals.server.consensus, res.locals.server.consensus[0].ports);*/
            //console.log("Render ManageServer |", res.locals/*, JSON.stringify(res.locals)*/);
            return next();
        }
    }
};

// update data
exports.AddOrUpdateServer = (req, res) => {
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    var serverData = new ServerModel(req.body['server-name'], req.body['server-location'], req.body['server-location-note'], req.body['server-network'], req.body['server-cpu'], req.body["server-user"], req.body["ssh-port"], req.body["operation-start"], req.body["vpn-id"], req.body["vpn-expiration"], req.body["nodejs_ver"], req.body["jdk_ver"]);
    //console.log("AddOrUpdateServer", req.body);
    
    serverData.AddClient(null, "execution", req.body["ec_1"], req.body["ec_1_ver"]);
    serverData.AddClient(null, "consensus", req.body["cc_1"], req.body["cc_1_ver"]);
    if(req.body['ethereum']) {
        if(req.body["mb_1_ver"] !== '') serverData.AddClient(null, "mev", req.body["mb_1"], req.body["mb_1_ver"]);
        
        serverData.AddClientPorts("execution",0,"ethereum", req.body["ethereum_ec_1_sn"], req.body["ethereum_ec_1_p"], req.body["ethereum_ec_1_p_c"], null, req.body["ethereum_ec_1_p_r"], req.body["ethereum_ec_1_sdp"]);
        serverData.AddClientPorts("consensus",0,"ethereum", req.body["ethereum_cc_1_sn"], req.body["ethereum_cc_1_p"], req.body["ethereum_cc_1_p_c"], null, req.body["ethereum_cc_1_p_q"], req.body["ethereum_cc_1_sdp"]);
    
        if(req.body["sc_rocketpool_ver"] !== "") serverData.AddClient(null,"service","rocketpool", req.body["sc_rocketpool_ver"]);
        if(req.body["sc_lido_ver"] !== "") serverData.AddClient(null,"service","lido", req.body["sc_lido_ver"]);
    }
    if(req.body['gnosis']) {
        serverData.AddClientPorts("execution",0,"gnosis", req.body["gnosis_ec_1_sn"], req.body["gnosis_ec_1_p"], req.body["gnosis_ec_1_p_c"], null, req.body["gnosis_ec_1_p_r"], req.body["gnosis_ec_1_sdp"]);
        serverData.AddClientPorts("consensus",0,"gnosis", req.body["gnosis_cc_1_sn"], req.body["gnosis_cc_1_p"], req.body["gnosis_cc_1_p_c"], null, req.body["gnosis_cc_1_p_q"], req.body["gnosis_cc_1_sdp"]);
    }
    if(req.body["sc_stakewise_ver"] && req.body["sc_stakewise_ver"] !== '') serverData.AddClient(null,"service","stakewise", req.body["sc_stakewise_ver"]);

    console.log("POST: AddOrUpdateServer", /*req.body,*/ serverData);
    /*try {
        console.log(serverData.execution[0].ports, serverData.consensus[0].ports);
    } catch(e){
        console.log(e);
    }*/

    const mysqlInst = new mysqlSrv();
    const userId = req.user.id;
    let serverId = req.query.sid;
    let changeLogMark = '';
    let onTasksScheduled = 5;
    if(serverId){ // update
        //console.log("updating server", serverData);
        // Get current Server info
        mysqlInst.GetServerClientsInfo(serverId, function(err,data){
            if(err) return ThrowError(err,res);
                
            let serverModel = new ServerModel();
            serverModel.GenerateFromMySqlStructure(data);

            if(data.length === 0) return ThrowError("Unauthorized action: Unknown server", res);
            if(serverModel.serverOwner !== userId) return ThrowError("Unauthorized action: Action allowed for Server owner only", res);

            changeLogMark = serverModel.CompareToNewValues(serverData);
                
            mysqlInst.UpdateServer(serverId, userId, serverData, function(err,result){
                if(err) return ThrowError(err,res);
                if(result.affectedRows === 0){ 
                    return ThrowError("Unauthorized action: User is not server owner",res);
                } else {
                    ProcessRemaining();
                }
            });
        });
        
    } else { // add
        console.log("adding server", req.body, serverData);
        mysqlInst.AddServer(userId, serverData, function(err,resp){
            if(err) return ThrowError(err,res);
            serverId = resp.insertId;
            //console.log("Server added | ServerId:", serverId, resp);
            mysqlInst.AttachUserAccessToServer(userId, serverId, function(err,resp){
                if(err) return ThrowError(err,res);
                //console.log("User access attached to server:", resp);
                onTasksScheduled = 1;
                OnTaskCompleted("Adding server");
            });
        });
    }

    function ProcessRemaining(){
        /*console.log("Process remaining:", serverId, serverData, "scheduledtasks:", onTasksScheduled);
        console.log("execution", serverData.execution, serverData.execution[0].ports);
        console.log("consensus", serverData.consensus, serverData.consensus[0].ports);*/
        //return res.redirect("/dashboard/server-node/define?id=1");
        mysqlInst.AttachClientToServer(serverId, "execution", serverData.execution, function(err,taskResults){
            if(err) return ThrowError(err,res);
            mysqlInst.AttachPortsToClient(taskResults, serverData.execution, function(err,resp){
                if(err) return ThrowError(err,res);
                OnTaskCompleted("execution-ports");
            });
        });
        mysqlInst.AttachClientToServer(serverId, "consensus", serverData.consensus, function(err,taskResults){
            if(err) return ThrowError(err,res);
            mysqlInst.AttachPortsToClient(taskResults, serverData.consensus, function(err,resp){
                if(err) return ThrowError(err,res);
                OnTaskCompleted("consensus-port");
            });
        });
        if(serverData.mev) {
            mysqlInst.AttachClientToServer(serverId, "mev", serverData.mev, function(err,resp){
                if(err) return ThrowError(err,res);
                OnTaskCompleted("mev");
            });
        } else {
            OnTaskCompleted("mev");
        }
        if(serverData.service.length > 0){
            mysqlInst.AttachClientToServer(serverId, "service", serverData.service, function(err,resp){
                if(err) return ThrowError(err,res);
                OnTaskCompleted("service");
            });
        } else {
            OnTaskCompleted("service");
        }

        if(changeLogMark !== ''){
            // Push to the log
            mysqlInst.AddServerAction(serverId, changeLogMark, function(err, resp){
                if(err) return ThrowError(err,res);
                OnTaskCompleted("processed-action");
            });
        } else {
            OnTaskCompleted("processed-action");
        }
    }

    function OnTaskCompleted(taskId){
        onTasksScheduled--;
        console.log("AddOrUpdateServer | OnTaskCompleted", taskId, "remainingTasks:", onTasksScheduled);
        if(onTasksScheduled === 0) {
            console.log("All task completed. Processing UpdateClientsRecommendations");
            // async task - update server recommendations for serverId
            fs.readFile(clientsFile, 'utf8', (err, data) => { if(err) { console.log(err); return; }
                mysqlInst.UpdateClientsRecommendations(JSON.parse(data), serverId); // rework
            });
            res.redirect("/dashboard?success=ServerDataUpdated");
        }
    }
};

exports.OnEditServerNote = function(req,res){
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    console.log("OnEditServerNote", req.query, req.body, req.user);
    new mysqlSrv().UpdateServerNote(req.query.sid, req.user.id, req.body.note, function(err,resp){
        if (err) return ThrowError(err,res);
        res.redirect('/dashboard/server-node/define?id='+req.query.sid+'&success=NoteUpdated');
    });
};

function ThrowError(err,res){
    console.log("err:", err);
    res.send(err);
}