"use strict";
const express = require('express');
const router = express.Router();
const Controller = require('../controllers/monitor.js');
const mysqlSrv = require('../services/mysqlDB');
const ServerModel = require('../models/dashboard/server');
const InstanceModel = require('../models/dashboard/instance');
const cache = require('../middlewares/cache');
const bodyParser = require('body-parser');

/*router.use(bodyParser.urlencoded({
    extended: true
}));*/
router.use(bodyParser.json(  ));
router.use(express.text());

// authentization
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConf = require('../config/config.secret.json').passport;
router.use(session({
	secret: passportConf.sessionSecret,
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	cookie: { secure: false,/*!appConfig.isLocalhost,*/ maxAge: (365*24*60*60000) }
}));
router.use(passport.initialize());
router.use(passport.authenticate('session'));
router.use(passport.session());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json( {limit: '2mb'} ));
router.use(cookieParser());

router.post('/validator-state', Controller.UpdateValidatorsState);
router.use('/web/cache', require('./cache'));

const azureCosmosDB = require('../services/azureCosmosDB');
const gnoDistributionToken = require('../config/config.secret.json').gnoDistributionToken;
const getDateFormatted = require('../utils/get-date-formatted.js');
// may be saved right by server, without web assistance...
router.post('/web/gno-balance', function(req, res){
    const dateFormat = getDateFormatted();
    if(req.query.st !== gnoDistributionToken) return res.status(500).send("Unauthorized access");

    let receivedData = req.body;
    receivedData.id = "gno-distribution-"+dateFormat;
    receivedData.date = dateFormat;
    receivedData.partitionKey = "gno-distribution";    
    console.log("saving", receivedData);
    azureCosmosDB.createFamilyItem("data", receivedData, (err,resp) => {
        console.log(err,resp);
        res.send("ok");
    });
});

router.post('/keystores', function(req, res){
    // if incoming data → process the data
    console.log("[API]/keystores", req.query, req.body);
    const chain = req.query.ch;

    if(Object.keys(req.body).length !== 0){
        // for loop async
        new mysqlSrv().UpdateValidatorInstance_Data(req.body.iid, 0, req.body.kid, null, function(err,result){
            if(err) console.log(err, req.query, req.body);
            if(result.affectedRows === 0) console.log("Unauthorized request: Action reserved for instance owner only", req.query, req.body);
        });
    }

    // take data from cache and return to server
    res.send(JSON.stringify(cache.getPubkeyFromQueue(chain)));
});

router.get('/account', function(req,res){
    console.log("Get account data | user:", req.user);
    // get user servers and instances on them - get owned servers with attached instances
    let respObj = {a:req.isAuthenticated(), d:{} };
    if(!req.user) return response();

    new mysqlSrv().GetOwnedServersWithAttachedInstances(req.user.id, function(err,data){
        if(err) console.log("GetOwnedServersWithAttachedInstances", err);

        for(const obj of data){
            // define server object
            if(!respObj.d[obj.sid]) respObj.d[obj.sid] = new ServerModel(obj.name, obj.location, obj.location_note, obj.ip_network, obj.cpu_type, obj.server_user, obj.ssh_port, obj.operation_start, obj.vpn_id, obj.vpn_expiration, obj.nodejs_ver, obj.jdkVer);
            respObj.d[obj.sid].AddInstance(new InstanceModel().GenerateFromMysqlResponse(obj));
            if(!obj.layer) continue;
            respObj.d[obj.sid].AddClient(obj.cid, obj.layer, obj.client, obj.ver);
            respObj.d[obj.sid].AddClientPorts(obj.layer, -1, obj.chain, obj.service_name, obj.port, obj.port_p2p, obj.port_p2pd, obj.port_2, obj.data_path);
        }
        return response();
    });

    function response(){ res.send(JSON.stringify(respObj)); }
});

router.get('/alert', function(req,res){
    // verify api key, get account instances
    
    // return: 0 = no notification 
            // 1 = common notification
            // 2 = critical notification 

    res.send(JSON.stringify({"alert":(cache.getOfflineStatesAlertType())}));
});


router.get('/node-snapshot', Controller.UpdateNodeState);
router.get('/hw-report', Controller.UpdateNodeState); // obsolete - move to node-status ?


module.exports = router;