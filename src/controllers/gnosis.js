"use strict";
var app = null;
const fs = require('fs'),
    path = require('path'),
    numeral = require('numeral'),
    httpXmlModule = require('../utils/xmlhttps');
const cache_validatorQueue = require('../middlewares/cache/validatorqueue');

const azureCosmosDB = require('../services/azureCosmosDB');
/*const BeaconChainData = require('../models/gnobeaconchaintable'),
      GnosischainData = require('../models/gnosischaintable');*/
const reduceObjectArray = require('../utils/reduceObjectArray');
const ValidatorQueueModel = require('../models/validatorqueue.js');

function GnosisController(){
    this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    //this.validatorHostingServicesData = path.join(__dirname, '..', '..', this.dataFile.gnosis.validatorHostingServices);
    this.cachedDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.gnosis);
    this.newsDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.news.gnosis);

    app = this;
}

GnosisController.prototype.Request = function(req,res, next){
    res.locals.page_hbs = 'gnosis-staking';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'chain';
    
    var tasks = 3;

    // load newsfeed
	fs.readFile(app.newsDataFile, 'utf8', (err, data) => {
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

    fs.readFile(app.cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const parsedData = JSON.parse(fileContent);
            res.locals.indicators = parsedData.indicators;
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.chainData = JSON.stringify(parsedData.chainData);
            //console.log("gno price:", parsedData.gnoDashboard.generalHealthOverview);
            res.locals.gnoPrice = numeral(parsedData.gnoDashboard.generalHealthOverview.gnoPrice).format('$0,0');
            res.locals.dashboardData = JSON.stringify(parsedData.gnoDashboard);
            //res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
            res.locals.chartsUIconfig = JSON.stringify({
                apr:{legend:false,xaxis:false,yaxis:false},
                validators:{legend:false,xaxis:false,yaxis:false},
                supply:{legend:false,xaxis:false,yaxis:false},
                balance:{legend:false,xaxis:false,yaxis:false,detailed:false}
            });
        
            // deposit contract
            let depositContract = parsedData.depositContract;
            res.locals.depositContract = {};
            res.locals.depositContract.lastState = depositContract.lastState;
            res.locals.depositContract.chart = JSON.stringify(depositContract.historicalChart);
            //res.locals.depositContract.distribution = JSON.stringify(depositContract.lastState.distribution);
            //console.log(res.locals.depositContract);
            
            taskCompleted();
        }
    });

    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.gnosis.validatorQueue), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            //console.log("cache.ValidatorQueue: ", cache_validatorQueue.getValidatorQueue("gnosis"));
            let model = new ValidatorQueueModel();
            res.locals.queue = model.GetSnapshot(cache_validatorQueue.getValidatorQueue("gnosis"), res.locals.chain, JSON.parse(data));
            //console.log(res.locals.queue);
            taskCompleted();
        }
    });

    function taskCompleted(){
        tasks--;
        if(tasks === 0) next();
    }
};

GnosisController.prototype.RequestLiquid = function(req,res,next){
    fs.readFile(app.cachedDataFile, 'utf8', (err, fileContent) => {
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
GnosisController.prototype.RequestSaas = function(req,res,next){
    fs.readFile(app.cachedDataFile, 'utf8', (err, fileContent) => {
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

GnosisController.prototype.Validators = function(req,res,next){
    res.locals.page_hbs = "shared_ethgno/validators";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "chain";

    let tasks = 3;
    // validators count
    fs.readFile(app.dataFile.pagecache.charts, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            res.locals.parsedData = JSON.parse(fileContent);
            // default values
            res.locals.ethStoreData = JSON.stringify(null);
            res.locals.beaconData = JSON.stringify(null);
            res.locals.chainData = JSON.stringify(null);
            res.locals.chartsUIconfig = JSON.stringify(null);
            res.locals.dashboardData = JSON.stringify(null);
            
            const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.jsController = 'validators';
            OnTaskCompleted();
        }
    });

    // validator current queue
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.gnosis.validatorQueue), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            let model = new ValidatorQueueModel();
            res.locals.queue = model.GetSnapshot(cache_validatorQueue.getValidatorQueue("gnosis"), res.locals.chain, JSON.parse(data));
            //console.log(res.locals.queue);
            OnTaskCompleted();
        }
    });
    
    // validator history queue
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.pagecache.validatorqueue.gnosis), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            res.locals.queueChart = JSON.stringify(JSON.parse(data));
            OnTaskCompleted();
        }
    });

    function OnTaskCompleted(){
        tasks--;
        if(tasks === 0) next();
    }
};

GnosisController.prototype.DepositContract = function(req,res,next){
    res.locals.page_hbs = "gnosis/deposit-contract-balance";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "chain";
    fs.readFile(app.dataFile.pagecache.gnosis, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const depositContract = JSON.parse(fileContent).depositContract;
            res.locals.depositContract = {};
            // deposit contract
            res.locals.depositContract.lastState = depositContract.lastState;
            //res.locals.current.time = 
 
            res.locals.depositContract.chart = JSON.stringify(depositContract.historicalChart);
            res.locals.depositContract.beaconchain_distribution = JSON.stringify(depositContract.lastState.beaconchain_distribution);
            res.locals.depositContract.unclaimedgno_distribution = JSON.stringify(depositContract.lastState.unclaimedgno_distribution); 

            res.locals.chartsUIconfig = JSON.stringify({
                apr:{legend:false,xaxis:false,yaxis:false},
                validators:{legend:false,xaxis:false,yaxis:false},
                supply:{legend:false,xaxis:false,yaxis:false},
                balance:{legend:false,xaxis:false,yaxis:false,detailed:false}
            });

            next();
        }
    });
};


GnosisController.prototype.CacheIndexData = function(cb){
    //console.log(`${new Date()} GnosisController.prototype.CacheIndexPageData`);

    var callbacks = 6;
    
    var vaultServicesData = null,
        validatorHostingServicesData = null,
        beaconData = null,
        chainData = null,
        gnoDashboardData = null,
        indicators = null,
        depositContract = null;

    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
        if(!err) {
            try {
                const parsedChartsDataCache = JSON.parse(fileContent).gnosis;
                beaconData = parsedChartsDataCache.beaconData;
                chainData = parsedChartsDataCache.chainData;
                indicators = parsedChartsDataCache.indicators;
            } catch(e){
                console.error(e);
            }
        }
        taskCompleted(err, "chartsCache");
    });

     // get validatorqueue data
     azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "gno-validatorqueue", function(err,data){
        if(err) return taskCompleted(err, "validatorqueue");
        //console.log(data);
        let chartData = new ValidatorQueueModel();
        chartData = chartData.ConvertToChartsArray(data, 0);
        fs.writeFile(app.dataFile.pagecache.validatorqueue.gnosis, JSON.stringify(chartData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                taskCompleted(err, "validatorqueue");
            }
            //console.log('File successfully updated.');
            taskCompleted(err, "validatorqueue");
        });
    });

    // get deposit contract balance data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.time',"gno-distribution", function(err,dbData){
        if (err)  return console.error("Err: Error querying family item:", err);;
        if (!dbData) return console.error("No data returned from query");
        
        depositContract = {
            lastState: {
                gno_validators: 0,
                gno_contract: 0,
                gno_unclaimed: 0,
                gno_balance: 0,
                gno_24h_difference: 0,
                beaconchain_distribution: {
                    holdings: [],
                    validators: [],
                    validators_count: 0
                },
                unclaimedgno_distribution: {
                    holdings: [],
                    wallets: [],
                    wallets_count: 0
                },
                epoch: 0,
                time: 0
            },
            historicalChart: {
                date: [],
                gno_validators: [], // beaconchain
                gno_unclaimed: [],
                gno_contract: [],
                gno_balance: []
            }
        };
        
        const marks = dbData.length;
        for(var i = 0; i < marks; i++){
            if(i === (marks - 1)){
                // last day
                depositContract.lastState.gno_validators = numeral(dbData[i].GNO_validators / 1e9).format('0,0');
                depositContract.lastState.gno_contract = numeral(dbData[i].GNO_contract  / 1e9).format('0,0');
                depositContract.lastState.gno_unclaimed = numeral(dbData[i].GNO_unclaimed  / 1e9).format('0,0');
                depositContract.lastState.gno_balance = numeral(dbData[i].bilance / 1e9).format('0,0');
                depositContract.lastState.epoch = dbData[i].epoch;
                
                depositContract.lastState.unclaimedgno_distribution.wallets_count = numeral(dbData[i].wallets).format('0,0');
                depositContract.lastState.beaconchain_distribution.validators_count = numeral(dbData[i].validators).format('0,0');

                // beaconchian holdings
                const beaconchain_entries = Object.entries(dbData[i].beaconchain_distribution);
                beaconchain_entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
                depositContract.lastState.beaconchain_distribution.holdings = beaconchain_entries.map(entry => entry[0]);
                depositContract.lastState.beaconchain_distribution.validators = beaconchain_entries.map(entry => entry[1]);

                // unclaimed gno holdings
                if(dbData[i].unclaimed_distribution){
                    const unclaimedgno_entries = Object.entries(dbData[i].unclaimed_distribution);
                    unclaimedgno_entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
                    depositContract.lastState.unclaimedgno_distribution.holdings = unclaimedgno_entries.map(entry => entry[0]);
                    depositContract.lastState.unclaimedgno_distribution.wallets = unclaimedgno_entries.map(entry => entry[1]);
                }
            } 

            depositContract.historicalChart.date.push(dbData[i].date);
            depositContract.historicalChart.gno_validators.push(dbData[i].GNO_validators / 1e9);
            depositContract.historicalChart.gno_unclaimed.push(dbData[i].GNO_unclaimed / 1e9);
            depositContract.historicalChart.gno_contract.push(dbData[i].GNO_contract / 1e9);
            depositContract.historicalChart.gno_balance.push(dbData[i].bilance / 1e9);
        }

        const days_count = depositContract.historicalChart.gno_balance.length;
        if(days_count >= 2){
            depositContract.lastState.gno_24h_difference = numeral(depositContract.historicalChart.gno_balance[days_count - 1] - depositContract.historicalChart.gno_balance[days_count - 2]).format('0,0');
        }
        
        taskCompleted(err, "contractbalance");
    });

    /*// Get beaconchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "gno-beaconchain", function(err,data){
        if(!err) beaconData = data;
        taskCompleted(err, "beacon");
    });

    // Get gnosisChain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "gnosischain", function(err,data){
        if(!err) chainData = data;
        taskCompleted(err, "chain");
    });*/

    // https get req from api
    new httpXmlModule().HttpsRequest({
        hostname: 'gnodashboard.azurewebsites.net',
        path: '/api/gnosis-overview',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    }, null, function(err,jsonData){
        if(err){
            console.log(err);
        } else {
            gnoDashboardData = JSON.parse(jsonData).data; 
            // inverse book value (display opportunity) ?
            for(var i=0;i<gnoDashboardData.bookValueTime.book_ratio.length;i++){
                gnoDashboardData.bookValueTime.book_ratio[i] = (1 - gnoDashboardData.bookValueTime.book_ratio[i]) * 100;
            }
        }
        taskCompleted(err, "gnodashboard api");
    });

    // Get Vault services data
    // console.log("Getting vauld services:", app.vaultServicesData);
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.gnosis.vaultServices), 'utf8', (err, fileContent) => {
        if(!err) vaultServicesData = JSON.parse(fileContent);
        taskCompleted(err, "vaultServices");
    });

    // Get validator hosting services data
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.gnosis.validatorHostingServices), 'utf8', (err, fileContent) => {
        if(!err) validatorHostingServicesData = JSON.parse(fileContent);
        taskCompleted(err, "hostingtServices");
    });

    function taskCompleted(err, taskId){ callbacks--;
        //console.log(taskId, "task completed |", callbacks, err);
        if(err || callbacks !== 0) {
            if(err) console.error(err);
            return;
        }

		//console.log(beaconData);
		//if(beaconData.length === 0) return;

        //const ethStoreDays = ethStoreData.length, validator_countsDays = beaconData.length;
        //if(ethStoreDays !== validator_countsDays) console.log(`Missing days data!!! | ethStoreDays ${ethStoreDays} vs validator_countsDays ${validator_countsDays} `);
        //const days = (ethStoreDays >= validator_countsDays) ? validator_countsDays : ethStoreDays;
        //console.log("days to render:", days);

        var aggregaredData = {
            vaultServices: vaultServicesData,
            hostingServices: validatorHostingServicesData,
            indicators: indicators,
            //chartData: null
            beaconData: reduceObjectArray(beaconData, -30),
            chainData: reduceObjectArray(chainData, -30),
            gnoDashboard: gnoDashboardData,
            depositContract: depositContract
            /*,
            ethStore: new EthStoreData().ConvertToChartsArray(ethStoreData, -30)*/
        };

        aggregaredData = JSON.stringify(aggregaredData, null, 2);

        // Post data to the file
        fs.writeFile(app.cachedDataFile, aggregaredData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return cb(err);
            }
            //console.log('File successfully updated.');
            return cb();
        });
    }
};

module.exports = GnosisController;