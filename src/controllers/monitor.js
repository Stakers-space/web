const crypto = require('crypto');
const cryptoConf = require('../config/config.secret.json').crypto["validator-api"];
const mysqlSrv = require('../services/mysqlDB');
const MailService = require('../services/customMailing');
const cache = require('../middlewares/cache');
const MailMessage = require('../models/emailMessage/validators_alert.js');

let noIncominMessageTimer = null;

/**
 * Update validators state and trigger alert if needed
*/
exports.UpdateValidatorsState = (req,res) => {
	// validate queries
	if(!req.query.n) return res.status(400).send('Missing network parameter');
	if(!req.query.t) return res.status(400).send('Missing token parameter');
	
	/**
	 * ToDo: Remake - based on server owner. Not account valkeys owner
	*/
    var data = null;
	if (req.is('application/json')) {
		data = req.body;
	} else if (req.is('text/plain')) {
		let decipher = crypto.createDecipheriv('aes-256-cbc', cryptoConf.key, cryptoConf.iv),
			decryptedData = decipher.update(req.body, 'base64', 'utf8');
		decryptedData += decipher.final('utf8');
		data = JSON.parse(decryptedData);
	} else {
		return res.status(415).send('Unsupported Content Type');
	}

	// check received epoch (same or higher than known)
	if(data.e < cache.getLastEpochReported()[req.query.n]) {
		console.log(`[API]/validator-state | Outdated data received from ${req.query.s} | ${req.query.n} | Epoch ${data.e}:`, data, req.query.t);
		return res.status(200).send("ignored:outdated data");
	}
	// Update last Epoch Reported Number
	cache.updateLastEpochReported(req.query.n, data.e);

	//console.log("/api/validator-state", req.headers['content-type'], decryptedData);
	console.log(`[API]/validator-state | ${req.query.s} | ${req.query.n} | Epoch ${data.e}`/*, data, req.query.t*/);
	
	// incoming - main key = instanceId (instance StringId as a meta information (Instances ids are known on the dashboard load))
	/**
	 * Deposit_keystores file encrypted to data
	 * On generating monitor definition file, unencrypt deposit all instances data in the browser and generate monitor_definition file
	 * Choose Either uploading the definition file to own server or Submit monitor definition file to monitor server
	*/

	let instanceReport = {}; // Convert account-based to instance-based (Temporary - accounts will be removed later, it will be based on instanceId with account api_token verification)
	let accountReport = {};
	// iterate through received data
	for (const [instanceId, instanceData] of Object.entries(data.i)) {
		
		instanceReport[instanceId] = instanceData; // vi1 = { v: 5, o: [ { i: '175285', e: 1065742, d: 4 }
		
		// if there's more than 10% offline validators, consider it as possitive, report it
		const offlineValidators = instanceData.o.length;
		if(offlineValidators > 30){
			console.log(`|  ├─ ${instanceId} | offline: `, offlineValidators, " / ", instanceData.v);
		} else {
			console.log(`|  ├─ ${instanceId}: `, instanceData);
		}
		if(offlineValidators / instanceData.v >= 0.1){ accountReport[instanceId] = `${offlineValidators} offline`/*instanceData*/; } // should be variable, based on number of validators in the instance
	}

	// push instanceReport to DB  (update `instances` - clmn `state`) - is loaded by dashboard - replaced by cache mechanism.
	cache.updateOfflineStates(instanceReport);

	// What about back online state???
	const instancesForAlert = Object.keys(accountReport);
	if(instancesForAlert.length > 0){ // & email reporting enabled (async action)
		console.log("ALERT | Get data for instances:", instancesForAlert);
		// get accounts for instances IN(instancesForAlert)
		new mysqlSrv().GetAccountsForInstances(instancesForAlert, function(err,data){
			if(err || data.length === 0) return console.log("err | data:",err, data);;
			
			let accounts = {};
			try {
				// aggregate instances under accounts
				for(let mark of data){
					if(!accounts[mark.account_id]) {
						accounts[mark.account_id] = mark;
						accounts[mark.account_id].instances = {};
					}
					if(mark.email_subscription === null || mark.email_alerts === null) continue;
										 		// key = instance name = XY offline
					accounts[mark.account_id].instances[mark.instance] = accountReport[mark.instance_id];
				}
				
				// send mail to all accounts
				if (Object.keys(accounts).length === 0) return;
				console.log("Email alert check", accounts);
				for (const key in accounts){
					if (accounts.hasOwnProperty(key)) {
						const account = accounts[key];
						let now = new Date().getTime();
						if (now - cache.getLastReportSent(account.account_id) > 300000) {
							const msg = MailMessage.OfflineAlert(account.instances);
							console.log("Sending Email alert to ", account.email_alerts);
							MailService.SendMail(null, account.email_alerts, msg.subject, msg.message);
							cache.setLastReportSent(account.account_id, now);
						}
					}
				}
			} catch(e){console.log(e);}
		});

		// get instances names

	}

	// no incomming message alert
	cache.getSetValidatorsStateSynced(true);
	clearTimeout(noIncominMessageTimer);
	//console.log("UpdateValidatorsState | Clearing and reActivating noIncominMessageTimer");
	noIncominMessageTimer = setTimeout(() => {
		console.log(new Date(), "UpdateValidatorState | Triggering No incoming message alert!!!");
		cache.getSetValidatorsStateSynced(false);
		if(process.env.PORT !== undefined) MailService.SendMail(null, "stakersspace@proton.me", "No incoming message alert", "No incoming message alert");
	}, 300000);

	// completing
	res.send("ok");
}

exports.UpdateNodeState = (req,res) => {
	const account_id = req.query.acc;
    const server_id =  req.query.srv;
    const api_token = req.query.key;
    let disk_usage = null;
	if(req.query.disk_usage) disk_usage = req.query.disk_usage.replace('%', '');
    const ram_usage = req.query.ram_usage;
    const swap_usage = req.query.swap_usage;
	const vpn_status = (req.query.vpn_s && req.query.vpn_s !== "N/A" && req.query.vpn_s !== "Unknown") ? req.query.vpn_s.toLowerCase() : null;	
	const vpn_connection = (req.query.vpn && req.query.vpn !== "N/A") ? req.query.vpn : null; // cz-prg-wg-101
	const cl_peers = (req.query.peer && req.query.peer !== "N/A") ? req.query.peer : null;

    if (!account_id || !api_token) return res.status(400).send('Missing account_id or api_token');
    
    console.log(`/api/hw-report> Account ID: ${account_id} | ServerId: ${server_id} | Disk Usage: ${disk_usage}% | RAM Usage: ${ram_usage}% | Swap Usage: ${swap_usage}% | CL peers: ${cl_peers} | VPN: ${vpn_status} / ${vpn_connection}`);

    if(ram_usage.indexOf("/") > -1 || swap_usage.indexOf("/") > -1){
        return res.status(200).send("Action required: Upgrade to ver 1.0.1");
    }

    // ToDO: push to RAM memory to spread demand (and mysql push from RAM)
    new mysqlSrv().Api_PushResourcesData(account_id, server_id, api_token, disk_usage, ram_usage, swap_usage, vpn_status, vpn_connection, cl_peers, function(err,resp){
        if(err) console.log(err);
        res.status(200).send((err) ? err : 'Data received');
    });
};