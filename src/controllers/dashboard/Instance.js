const mysqlSrv = require('../../services/mysqlDB');
const ServerModel = require('../../models/dashboard/server');
const InstanceModel = require('../../models/dashboard/instance.js');

const sanitizeHtml = require('sanitize-html');

const cache = require('../../middlewares/cache');
cache.setLastEpochReported(0);

exports.DefineInstance = (req, res, next) => {
    // ToDo: Protection - Allow view for accounts with access only
    
    const serverId = req.query.sid; // id, not name. → Get Server data?
    const instanceId = req.query.iid;
    console.log("DefineInstance",serverId, instanceId);
    
    const mysqlInst = new mysqlSrv();
    mysqlInst.GetServerClientsInfo(serverId, function(err,result){ // does not need ports, nor client?
        if(err) return OnTaskCompleted(err);
        if(result.length === 0) return OnTaskCompleted("Unauthorized request: No server found");
        
        const serverObj = new ServerModel();
        serverObj.GenerateFromMySqlStructure(result);
        // if there is no consensus client defined, use default "validator"
        if(serverObj.consensus.length === 0){ serverObj.AddClient(null, "consensus", "validators", null); }

        res.locals.server = serverObj;

        res.locals.hbs = "manageInstance";
        res.locals.forms = {
            metadata:{
                submitLink: "/dashboard/define-instance?sid="+serverId,
                submitText: "Add Instance"
            },
            monitor:{
                submitLink: "/dashboard/define-instance/keystores",
                submitText: "Activate pubkey monitoring"
            },
            link: {
                submitLink: "/dashboard/define-instance/link-account?sid="+serverId,
                submitText: "Link Account"
            },
            linkserver: {
                submitLink: "/dashboard/define-instance/link-instance?sid="+serverId,
                submitText: "Move Instance"
            }
        }

        res.locals.formTitle = "Add New Validator Instance to Server "+serverObj.serverName;
        res.locals.instance = new InstanceModel(null,null);

        let scheduledInnerTasks = 1;

        if(!instanceId){
            res.locals.instance = {vi_pid: 1};
            return OnTaskCompleted(null);
        }

        // Edit instance
        res.locals.editingView = true;
        res.locals.forms.metadata.submitText = "Submit Instance edit";
        res.locals.forms.metadata.submitLink += "&iid="+instanceId;
        res.locals.forms.monitor.submitLink += "?sid="+serverId+"&iid="+instanceId;
        res.locals.forms.link.submitLink += "&iid="+instanceId;
        res.locals.forms.linkserver.submitLink += "&iid="+instanceId;
        res.locals.accountsWithAccess = null;

        scheduledInnerTasks = 3;

        /* Get all instances for which the user has access **/
        mysqlInst.GetAccountsWithAccessToInstance(instanceId, function(err, data){   
            res.locals.accountsWithAccess = data;
            OnTaskCompleted(err);
        });

        // get instance data by id
        mysqlInst.GetValidatorInstance(instanceId, function(err, result){
            //console.log("GetValidatorInstance",instanceId, result);
            if(err) { res.locals.err = err; return next(); }
            if(result.length !== 1) return OnTaskCompleted("Unauthorized request: No instance found");
            
            res.locals.instance = new InstanceModel().GenerateFromMysqlResponse(result[0]);
            res.locals.formTitle = `Edit Validator Instance ${res.locals.instance.instance} (private ID ${res.locals.instance.vi_pid}) at Server `+serverObj.serverName;
            //console.log(res.locals);
            OnTaskCompleted();
        });

        // Get account servers
        mysqlInst.GetOwnedServers(req.user.id, function(err,data){
            if(err) console.log(err);
            res.locals.servers = data;
            OnTaskCompleted();
        });

        function OnTaskCompleted(err){
            if(err) {
                res.locals.err = err;
                return next();
            }
            scheduledInnerTasks--;
            if(scheduledInnerTasks === 0) {
                if(instanceId){
                    let isAccessible = false;
                    for(const obj of res.locals.accountsWithAccess){
                        //console.log(obj.id, instanceId);
                        if(obj.id == req.user.id){
                            isAccessible = true;
                            break;
                        }
                    }
                    if(!isAccessible) res.locals.err = "Unauthorized access";
                }
                next();
            }
        }
    });
};

exports.AddOrUpdateInstanceMetadata = (req, res) => {
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    console.log("AddOrUpdateInstance", req.body);
    const userId = req.user.id;
    const serverId = req.query.sid;
    let instanceId = req.query.iid;
    
    // owner ?? - cannot be the server owner, but user. But it's processed by server owner...
    var instanceData = new InstanceModel(req.user.id, req.body['name'], req.body['note'], null, serverId, null, null, req.body['fee_recipient'], req.body['vi_sname'], req.body['vi_suser'], req.body['vi_sdata'], req.body['vi_pid']);

    const mysqlInst = new mysqlSrv();
    if(instanceId){ // update instance
        // verify the account updating the instace?
        mysqlInst.UpdateValidatorInstance(instanceId, userId, serverId, instanceData, function(err,result){
            if (err) return ThrowError(err,res);
            
            if(result.affectedRows === 0){ 
                return ThrowError("Unauthorized action: User is not server owner",res);
            } else {
                SuccessfulResponse();
            }
        });

    } else { // add instance
        mysqlInst.AddValidatorInstance(userId, serverId, instanceData, function(err,resp){
            if(err) return ThrowError(err,res);

            instanceId = resp.insertId;
            //console.log("Instance added | instanceId:", instanceId, resp);
            mysqlInst.AttachUserAccessToValidatorInstance(userId, instanceId, function(err,resp){
                if(err) return ThrowError(err, res);
                
                //console.log("User access attached to server:", resp);
                SuccessfulResponse();
            });
        });
        // add access (option to add access over email as well for server owner)
    }

    function SuccessfulResponse(){
        res.redirect("/dashboard?success=ValidatorInstanceUpdated");
    }
};

exports.LinkInstanceToAccount = function(req,res,next){
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    console.log("LinkInstanceToAccount", req.body);
    const userId = req.user.id;
    const serverId = req.query.sid;
    let instanceId = req.query.iid;
    const chain = req.body.chain;
    const accountEmail = req.body.email;
    // get userId based on email
    const mysqlInst = new mysqlSrv();
    // get instance owner

    mysqlInst.GetValidatorInstance(instanceId, function(err,instanceData){
        if (err) return ThrowError(err,res);
        if(instanceData.length === 0) if (err) return ThrowError("No instance found",res);
        if(instanceData[0].owner !== userId) return ThrowError("Unauthorized access: Only instance owner can manage accesses",res);
        mysqlInst.GetAccountData(accountEmail, function(err,results){
            if (err) return ThrowError(err,res);
            // limit modifying access for instance owner only
            if(results.length === 0) if (err) return ThrowError("No account found under attached email",res);
            mysqlInst.AttachUserAccessToValidatorInstance(results[0].id, instanceId, function(err,resp){
                if (err) return ThrowError(err,res);
                res.redirect("/dashboard/server-node/define-instance?sid="+serverId+"&iid="+instanceId+"&success=AccessLinked");
            })
        });
    });
};

exports.OnProcessKeystores = function(req,res){
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    console.log("[Instance API] OnProcessKeystores", req.query/*, req.body, req.user*/);
    if(!req.user.id) return ThrowError("Action rejected", res);

    const chain = req.body.chain;

    const password = sanitizeHtml(req.body.psw);
    const fileName = sanitizeHtml(req.body.dd_filename);
    const monitor = (req.body.pubkey_monitoring === "1")
    let pubkeysInp = sanitizeHtml(req.body.pubkeys);
    if(pubkeysInp.indexOf("&") !== -1 || pubkeysInp.indexOf("<") !== -1 || pubkeysInp.indexOf(">") !== -1) return ThrowError("Action rejected", res);
    
    // clear all spaces
    pubkeysInp = pubkeysInp.replace(/\s+/g, '');
    
    pubkeysInp = pubkeysInp.split(",");
    let pubkeysC = pubkeysInp.length;

    // recognize pubkeys vs pubIndexes
    let pubkeyCounter = 0;
    let indexCounter = 0;

    let pubKeys = null;
    let pubIndexes = null;

    // verify length
    for(const pubkey of pubkeysInp){ 
        if(pubkey.length === 98 && pubkey.startsWith("0x")) {
            pubkeyCounter++;
        } else if(!isNaN(Number(pubkey))){
            indexCounter++;
        }
    }

    if(pubkeyCounter === pubkeysC){
        pubKeys = pubkeysInp;
    } else if(indexCounter === pubkeysC){
        pubIndexes = pubkeysInp;
    } else {
        console.log(`pubkeyCounter: ${pubkeyCounter} | indexCounter: ${indexCounter} | refCount: ${pubkeysC}`)
        return ThrowError("Action rejected", res);
    }

    let dbStatus = (pubKeys) ? `Processing file ${fileName}` : `Processing sent ids`;

    //console.log(pubkeys);
    // verify sender & update data
    new mysqlSrv().UpdateValidatorInstance_Data(req.query.iid, req.user.id, dbStatus, chain, function(err,result){
        if(err) return ThrowError(err, res);
        if(result.affectedRows === 0) return ThrowError("Unauthorized request: Action reserved for instance owner only", res);
        // push to queue
        cache.addPubkeystoQueue(chain, req.query.iid, pubKeys, pubIndexes, password, monitor); // what if sent more times? - protected by UI (status processing instead of choose file)
        res.redirect('/dashboard/server-node/define-instance?sid='+req.query.sid+'&iid='+req.query.iid+'&success=processing');
    });
};

exports.OnLinkInstance = function(req,res){
    if(res.locals.isDemoAccount) return ThrowError("Action restricted for demo account",res);
    console.log(req.query, req.body);
    new mysqlSrv().UpdateServerIdForInstance(req.qurey.iid, req.query.sid, req.body.server_id, req.query.id, function(err,resp){
        if(err){
            return ThrowError(err,res);
        } else {
            console.log(resp);
            res.redirect('/dashboard&success=instanceMoved');
        }
    });
};

function ThrowError(err,res){
    console.log("err:", err);
    res.send(err);
}