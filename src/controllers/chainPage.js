"use strict";
var app = null;
const fs = require('fs'),
	  path = require('path');

function ChainPagePresenter(){ 
    app = this;
}

ChainPagePresenter.prototype.Request = function(req, res, next){
	console.log("ChainPagePresenter.Request");
    
	const pathParts = req.originalUrl.split('/').filter(Boolean);
	// Recognize chain
    res.locals.chain = pathParts[0].split("-")[0];//(pathParts[0] === "ethereum-staking") ? "ethereum" : "gnosis";/* pathParts[0];*/
	
	// Recognize page
	if(pathParts.length > 1){
		res.locals.page = pathParts[1];
		res.locals.layout = "standard";
		app.getPageData(res.locals, function(err){
			if(err) res.status(500).send(err);
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

ChainPagePresenter.prototype.getPageData = function(locals, cb){
	console.log("ChainPagePresenter.getPageData");
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
		}
		callbackReceived(err);
	});

	function callbackReceived(err){
		if(err) cb(err);
		callbacks--;
		if(callbacks === 0) {
			locals.executionClients = clientsData.executionLayer;
			locals.consensusClients = clientsData.consensusLayer;
			cb(err);
		}
	}

};

ChainPagePresenter.prototype.getCategoryData = function(locals, cb){
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

ChainPagePresenter.prototype.Response = function(req,res){
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
		cssFile:"docs",//req.appData.meta.css,
		chain: res.locals.chain,
		chainData: res.locals.chainData,
		executionClients: res.locals.executionClients,
		consensusCLients: res.locals.consensusClients,
		helpers: {}
	});
};

module.exports = ChainPagePresenter;