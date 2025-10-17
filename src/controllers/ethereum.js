"use strict";
const fs = require('fs'),
    path = require('path');/*,
    numeral = require('numeral');*/
const cache_validatorQueue = require('../middlewares/cache/validatorqueue');
const cache_assetPrice = require('../middlewares/cache/asset-price.js'); 

const azureCosmosDB = require('../services/azureCosmosDB');
const reduceObjectArray = require('../utils/reduceObjectArray');
const ValidatorQueueModel = require('../models/validatorqueue');

const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
const cachedDataFile = path.join(__dirname, '..', '..',  dataFile.pagecache.ethereum);
const newsDataFile = path.join(__dirname, '..', '..',  dataFile.pagecache.news.ethereum);

exports.HOME = (req, res, next) => {
    res.locals.page_hbs = 'ethereum/index';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'chainpage';
    res.locals.title = `Ethereum (ETH) Network Overwiew | Stakers.space`;
    res.locals.metaDescription = `Stakers.space is a space full of guides, tools and advices targeted at Ethereum staking.`;

    res.locals.ethPrice = cache_assetPrice.Get().eth_usd;

    var tasks = 2;
    
    // load newsfeed → move to DB (or regenerate the file from db)
	fs.readFile(newsDataFile, 'utf8', (err, data) => {
		if(!err) {
            try {
                const jsonData = JSON.parse(data);
                res.locals.newsfeed = jsonData;
            } catch (err) {
                console.error(err);
            }
		}
		taskCompleted(err);
	});

    fs.readFile(cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.indicators = parsedData.indicators;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.chainData = JSON.stringify(parsedData.chainData);
            res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
            res.locals.chartsUIconfig = JSON.stringify({
                apr:{legend:false,xaxis:false,yaxis:false},
                validators:{legend:false,xaxis:false,yaxis:false},
                supply:{legend:false,xaxis:false,yaxis:false},
                balance:{legend:false,xaxis:false,yaxis:false,detailed:false}
            });
            
            taskCompleted();
        }
    });

    function taskCompleted(){
        tasks--;
        if(tasks === 0) next();
    }
}

exports.STAKING = (req, res, next) => {
    res.locals.page_hbs = 'ethereum/staking';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'chainpage';
    res.locals.title = `All around Ethereum Staking at one place.`;
    res.locals.metaDescription = `Stakers.space is a space full of guides, tools and advices targeted at Ethereum staking.`;

    res.locals.ethPrice = cache_assetPrice.Get().eth_usd;

    var tasks = 3;
    
    // load newsfeed → move to DB (or regenerate the file from db)
	fs.readFile(newsDataFile, 'utf8', (err, data) => {
		if(!err) {
            try {
                const jsonData = JSON.parse(data);
                res.locals.newsfeed = jsonData;
            } catch (err) {
                console.error(err);
            }
		}
		taskCompleted(err);
	});

    fs.readFile(cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.indicators = parsedData.indicators;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.chainData = JSON.stringify(parsedData.chainData);
            res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
            res.locals.chartsUIconfig = JSON.stringify({
                apr:{legend:false,xaxis:false,yaxis:false},
                validators:{legend:false,xaxis:false,yaxis:false},
                supply:{legend:false,xaxis:false,yaxis:false},
                balance:{legend:false,xaxis:false,yaxis:false,detailed:false}
            });
            
            taskCompleted();
        }
    });

    // validator current queue
    fs.readFile(path.join(__dirname, '..', '..', dataFile.ethereum.validatorQueue), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            let model = new ValidatorQueueModel();
            res.locals.queue = model.GetSnapshot(cache_validatorQueue.getValidatorQueue("ethereum"), res.locals.chain, JSON.parse(data));
            //console.log("res.locals.queue", res.locals.queue);
            taskCompleted();
        }
    });

    function taskCompleted(){
        tasks--;
        if(tasks === 0) next();
    }
}

exports.OVERVIEW = function(req, res, next){
    next();
};

exports.RequestLiquid = function(req,res,next){
    res.locals.title = `${res.locals.chainName} Liquid staking services list`;
    res.locals.metaDescription = `List of Liquid staking services on ${res.locals.chainName} chain.`;

    fs.readFile(cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.page_hbs = "vaults";
            res.locals.layout_hbs = "amp";
            res.locals.css_file = "chain";
            next();
        }
    });
};
exports.RequestSaas = function(req,res,next){
    res.locals.title = `${res.locals.chainName} SAAS (Staking as a service) services list`;
    res.locals.metaDescription = `List SAAS (Staking as a service) services on ${res.locals.chainName} chain.`;
    fs.readFile(cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.page_hbs = "validatorsaas";
            res.locals.layout_hbs = "amp";
            res.locals.css_file = "chain";
            next();
        }
    });
};
exports.SmoothingPools = function(req,res,next){
    res.locals.page_hbs = "ethereum/smoothing-pools";
    res.locals.layout_hbs = "amp";
    res.locals.css_file = "chain";
    res.locals.title = `${res.locals.chainName} staking Smoothing pools list`;
    res.locals.metaDescription = `List of smoothing pools on ${res.locals.chainName} chain.`;
    next();
};
exports.RelayList = function(req,res,next){
    res.locals.title = `${res.locals.chainName} MEV-relay list`;
    res.locals.metaDescription = `MEV-relay list of services on ${res.locals.chainName} chain.`;
    fs.readFile(path.join(__dirname, '..', '..', dataFile.ethereum.mevRelayList), 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.relays = parsedData.relays;
            res.locals.monitors = parsedData.monitors;
            res.locals.page_hbs = "ethereum/mev-relay-list";
            res.locals.layout_hbs = "amp";
            res.locals.css_file = "chain";
            next();
        }
    });
};

exports.Keystores = function(req,res,next){
    res.locals.title = `Guide to generate abd deposit Validator keys for ${res.locals.chainName} staking`;
    res.locals.metaDescription = `Complete indotrduction to validator keystores for staking on ${res.locals.chainName} chain.`;
    res.locals.page_hbs = "guides/keystores";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "guides";
    next();
};

exports.CacheIndexData = function(cb){
    //console.log(`${new Date()} EthereumController.prototype.CacheIndexPageData`);

    var callbacks = 4/*5*/;
    
    var ethStoreData = null,
        vaultServicesData = null,
        validatorHostingServicesData = null,
        beaconchainData = null,
        etherchainData = null,
        indicators = null,
        valcount = null,
        valcount_history = null;

    fs.readFile(path.join(__dirname, '..', '..', dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
        if(!err) {
            const parsedChartsDataCache = JSON.parse(fileContent).ethereum;
            ethStoreData = parsedChartsDataCache.ethStore;
            beaconchainData = parsedChartsDataCache.beaconData;
            etherchainData = parsedChartsDataCache.chainData;
            indicators = parsedChartsDataCache.indicators;
            valcount = parsedChartsDataCache.valcount;
            valcount_history = parsedChartsDataCache.valcount_history;
        }
        taskCompleted(err, "chartsCache");
    });

    // get validatorqueue data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "eth-validatorqueue", function(err,data){
        if(err) return taskCompleted(err, "validatorqueue");
        //console.log(data);
        let chartData = new ValidatorQueueModel();
        chartData = chartData.ConvertToChartsArray(data, 0);
        fs.writeFile(path.join(__dirname, '..', '..', dataFile.pagecache.validatorqueue.ethereum), JSON.stringify(chartData, null, 2), 'utf8', (err) => {
            if (err) console.error('Error writing file:', err);
            //console.log('File successfully updated.');
            taskCompleted(err, "validatorqueue");
        });
    });

    // get ethstore data
    /*azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "ethstore", function(err,data){
        if(!err) ethStoreData = data;
        taskCompleted(err, "ethstore");
    });

     // Get beaconchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "beaconchain", function(err,data){
        if(!err) beaconchainData = data;
        taskCompleted(err, "beaconchain");
    });

    // Get etherchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "etherchain", function(err,data){
        if(!err) etherchainData = data;
        taskCompleted(err, "etherchain");
    });*/

    // Get Vault services data
    // console.log("Getting vauld services:", vaultServicesData);
    fs.readFile(path.join(__dirname, '..', '..', dataFile.ethereum.vaultServices), 'utf8', (err, fileContent) => {
        if(!err) vaultServicesData = JSON.parse(fileContent);
        taskCompleted(err, "vaultServices");
    });

    // Get validator hosting services data
    fs.readFile(path.join(__dirname, '..', '..', dataFile.ethereum.validatorHostingServices), 'utf8', (err, fileContent) => {
        if(!err) validatorHostingServicesData = JSON.parse(fileContent);
        taskCompleted(err, "hostingtServices");
    });

    function taskCompleted(err, taskId){ callbacks--;
        //console.log(taskId, "task completed |", callbacks, err);
        if(err || callbacks !== 0) {
            if(err) console.error(err);
            return;
        }

        var aggregaredData = {
            vaultServices: vaultServicesData,
            hostingServices: validatorHostingServicesData,
            indicators: indicators,
            //chartData: null
            // last 30 days display
            beaconData: reduceObjectArray(beaconchainData, -30),
            chainData: reduceObjectArray(etherchainData, -30),
            ethStore: reduceObjectArray(ethStoreData, -30),
            valcount
        };
        //console.log(aggregaredData.beaconChain);

        aggregaredData = JSON.stringify(aggregaredData, null, 2);

        // Post data to the file
        fs.writeFile(cachedDataFile, aggregaredData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return cb(err);
            }
            //console.log('File successfully updated.');
            return cb();
        });
    }
};