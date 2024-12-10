"use strict";
var app = null;
const fs = require('fs'),
	  path = require('path');
const azureCosmosDB = require('../services/azureCosmosDB');
const BeaconchainDataModel = require('../models/ethbeaconchaintable.js'),
	  GnoBeaconchainDataModel = require('../models/gnobeaconchaintable'),
	  EthStoreDataModel = require('../models/ethstoretable.js'),
	  EtherChainDataModel = require('../models/etherchaintable.js');

function FundamentalsPagePresenter(){ 
	app = this;
}

FundamentalsPagePresenter.prototype.Request = function(req, res, next){
	console.log("FundamentalsPagePresenter.Request");

	// get all charts data
    
	const pathParts = req.originalUrl.split('/').filter(Boolean);
	// Recognize chain
    res.locals.chain = pathParts[0].split("-")[0];//(pathParts[0] === "ethereum-staking") ? "ethereum" : "gnosis";/* pathParts[0];*/
	
	// Recognize page
	if(pathParts.length > 1){
		res.locals.page = pathParts[1];
		res.locals.layout = "standard";
		app.getPageData(res.locals, function(err){
			if(err) res.status(500).send(err);
			//console.log(res.locals);
			next();
		});
	} else { // is Category page
		res.locals.page = "chain";
		res.locals.layout = "amp";
		app.getCategoryData(res.locals, function(err){
			if(err) res.status(500).send(err);
			next();
		});
	}
};

FundamentalsPagePresenter.prototype.getPageData = function(locals, cb){
	console.log("ChainPagePresenter.getPageData");
	// load data for category page
	var callbacks = (locals.chain === "ethereum") ? 4 : 2;
	locals.chainData = null;

	fs.readFile('./data/newsfeed.json', 'utf8', (err, data) => {
		if(!err) {
			try {
				const jsonData = JSON.parse(data);
				locals.newsfeed = jsonData;
			  } catch (err) {
				console.error(err);
			  }
		}
		callbackReceived(err);
	});

	var beaconChainPartialKey = "gno-beaconchain";

	if(locals.chain === "ethereum"){
		// get ethstore data
		azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "ethstore", function(err,data){
			if(!err) locals.ethStoreData =  JSON.stringify(new EthStoreDataModel().ConvertToChartsArray(data));
			callbackReceived(err);
		});

		azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "etherchain", function(err,data){
			if(!err) locals.etherchainData = JSON.stringify(new EtherChainDataModel().ConvertToChartsArray(data));
			callbackReceived(err);
		});

		beaconChainPartialKey = "beaconchain";
	} else {
		locals.ethStoreData = null;
		locals.etherchainData = null;
		locals.page = "gno-fundamentals";
	}

     // Get beaconchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', beaconChainPartialKey, function(err,data){
        if(!err) {
			var dataModel = (locals.chain === "ethereum") ? new BeaconchainDataModel() : new GnoBeaconchainDataModel();
			const dataArr = dataModel.ConvertToChartsArray(data),
				  lastCount = dataArr.validators[dataArr.validators.length - 1];
			locals.validators = {
				last: lastCount,
				increments: {
					day: lastCount - dataArr.validators[dataArr.validators.length - 2],
					week: lastCount - dataArr.validators[dataArr.validators.length - 7],
					month: lastCount - dataArr.validators[dataArr.validators.length - 30],
					year: lastCount - dataArr.validators[dataArr.validators.length - 365]
				}
			}
			locals.beaconchainData = JSON.stringify(dataArr);
		}
        callbackReceived(err);
    });

	/*fs.readFile('./data/chains/'+locals.chain+'.json', 'utf8', (err, data) => {
		if(!err) {
			try { locals.chainData = JSON.parse(data);	} catch (e) { err = e; }
		}
		callbackReceived(err);
	});

	fs.readFile('./data/clients.json', 'utf8', (err, data) => {
		if(!err) {
			try { clientsData = JSON.parse(data); } catch (e) { err = e; }
		}
		callbackReceived(err);
	});*/

	function callbackReceived(err){
		if(err) cb(err);
		callbacks--;
		if(callbacks === 0) {
			//locals.executionClients = clientsData.executionLayer;
			//locals.consensusClients = clientsData.consensusLayer;
			cb(err);
		}
	}

};

FundamentalsPagePresenter.prototype.getCategoryData = function(locals, cb){
	console.log("ChainPagePresenter.getCategoryData");
	// load data for category page
	var callbacks = 2;
	locals.chainData = null;
	var clientsData = null;
	fs.readFile('./data/chains/'+locals.chain+'.json', 'utf8', (err, data) => {
		if(!err) {
			try { locals.chainData = JSON.parse(data);	} catch (e) { err = e; }
		}
		callbackReceived(err);
	});

	fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
		if(!err) {
			try { clientsData = JSON.parse(data); } catch (e) { err = e; }
			console.log(clientsData);
		}
		callbackReceived(err);
	});
   
	function callbackReceived(err){
		if(err) cb(err);
		callbacks--;
		if(callbacks === 0) {
			locals.executionClients = GetMatchedArray(locals.chainData.executionClients, clientsData.executionLayer);
			locals.consensusClients = GetMatchedArray(locals.chainData.consensusClients, clientsData.consensusLayer);
			cb(err);
		}
	}

	function GetMatchedArray(chainData, clients){
		var matchedArr = [];
		Object.entries(chainData).forEach(([client, value]) => {
			clients[client].state = value;
			matchedArr.push(clients[client]);
		});
		return matchedArr;
	}
};

FundamentalsPagePresenter.prototype.Response = function(req,res){
	//console.log("ChainPagePresenter.Response", res.locals);
	//console.log("ChainPagePresenter.prototype.Response", res.locals);
    res.render(res.locals.page, {
		layout: res.locals.layout,
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		title: "Stakers.space",//req.appData.meta.title,
		metaDescription: null,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		cssFile:"hp",//req.appData.meta.css,
		chain: res.locals.chain,
		chainData: res.locals.chainData,
		executionClients: res.locals.executionClients,
		consensusCLients: res.locals.consensusClients,
		helpers: {}
	});
};

module.exports = FundamentalsPagePresenter;