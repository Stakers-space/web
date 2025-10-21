"use strict";
var app = null;
const fs = require('fs'),
    path = require('path'),
    numeral = require('numeral');
const cache_validatorQueue = require('../middlewares/cache/validatorqueue');
const cache_assetPrice = require('../middlewares/cache/asset-price.js'); 

const azureCosmosDB = require('../services/azureCosmosDB');
/*const BeaconChainData = require('../models/gnobeaconchaintable'),
      GnosischainData = require('../models/gnosischaintable');*/
const reduceObjectArray = require('../utils/reduceObjectArray');
const ValidatorQueueModel = require('../models/validatorqueue.js');

const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
const cachedDataFile = path.join(__dirname, '..', '..',  dataFile.pagecache.gnosis);
const newsDataFile = path.join(__dirname, '..', '..',  dataFile.pagecache.news.gnosis);

exports.HOME = function(req,res, next){
    res.locals.page_hbs = 'gnosis/index';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'chainpage';
    res.locals.title = `Gnosis (GNO) Network Overwiew | Stakers.space`;
    res.locals.metaDescription = `Stakers.space is a space full of guides, tools and advices targeted at Gnosis staking.`;
    
    var tasks = 2;

    // load newsfeed
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
            const {gno_usd} = cache_assetPrice.Get();

            const parsedData = JSON.parse(fileContent);
            res.locals.indicators = parsedData.indicators;
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.chainData = JSON.stringify(parsedData.chainData);

            //console.log(parsedData.valuationData);
            res.locals.gnoPrice = gno_usd;
            res.locals.valuationData = JSON.stringify(parsedData.valuationData);
            res.locals.circulationData = JSON.stringify(parsedData.circulationData);

            //res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
            
            // deposit contract
            let depositContract = parsedData.depositContract;
            res.locals.depositContract = {};
            res.locals.depositContract.lastState = depositContract.lastState;
            res.locals.depositContract.chart = JSON.stringify(depositContract.historicalChart);
            //res.locals.depositContract.distribution = JSON.stringify(depositContract.lastState.distribution);
            //console.log(res.locals.depositContract);
            
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

exports.STAKING = function(req,res, next){
    res.locals.page_hbs = 'gnosis/staking';
    res.locals.layout_hbs = "standard";
    res.locals.css_file = 'chainpage';
    res.locals.title = `All around Gnosis Staking at one place.`;
    res.locals.metaDescription = `Stakers.space is a space full of guides, tools and advices targeted at Gnosis staking.`;
    
    var tasks = 3;

    // load newsfeed
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
            const {gno_usd} = cache_assetPrice.Get();

            const parsedData = JSON.parse(fileContent);
            res.locals.indicators = parsedData.indicators;
            res.locals.vaultServices = parsedData.vaultServices;
            res.locals.hostingServices = parsedData.hostingServices;
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.chainData = JSON.stringify(parsedData.chainData);

            //console.log(parsedData.valuationData);
            res.locals.gnoPrice = gno_usd;
            res.locals.valuationData = JSON.stringify(parsedData.valuationData);
            res.locals.circulationData = JSON.stringify(parsedData.circulationData);

            //res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
            
            // deposit contract
            let depositContract = parsedData.depositContract;
            res.locals.depositContract = {};
            res.locals.depositContract.lastState = depositContract.lastState;
            res.locals.depositContract.chart = JSON.stringify(depositContract.historicalChart);
            //res.locals.depositContract.distribution = JSON.stringify(depositContract.lastState.distribution);
            //console.log(res.locals.depositContract);
            
            res.locals.chartsUIconfig = JSON.stringify({
                apr:{legend:false,xaxis:false,yaxis:false},
                validators:{legend:false,xaxis:false,yaxis:false},
                supply:{legend:false,xaxis:false,yaxis:false},
                balance:{legend:false,xaxis:false,yaxis:false,detailed:false}
            });

            taskCompleted();
        }
    });

    fs.readFile(path.join(__dirname, '..', '..', dataFile.gnosis.validatorQueue), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            let model = new ValidatorQueueModel();
            res.locals.queue = model.GetSnapshot(cache_validatorQueue.getValidatorQueue("gnosis"), res.locals.chain, JSON.parse(data));
            //console.log("GNO | res.locals.queue:", res.locals.queue.current.stateCount);
            taskCompleted();
        }
    });

    function taskCompleted(){
        tasks--;
        if(tasks === 0) next();
    }
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

exports.OVERVIEW = function(req, res, next){
    next();
};

exports.DepositContract = function(req,res,next){
    res.locals.page_hbs = "gnosis/deposit-contract-balance";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "chain";
    res.locals.title = `Gnosis Deposit contract tracker`;
    res.locals.metaDescription = `Gnosis Deposit contract tracker track wealth of the Gnosis chain.`;
    fs.readFile(cachedDataFile, 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            const depositContract = JSON.parse(fileContent).depositContract;
            res.locals.depositContract = {};
            // deposit contract
            res.locals.depositContract.lastState = depositContract.lastState;
            //res.locals.current.time = 
            try {
                res.locals.depositContract.chart = JSON.stringify(depositContract.historicalChart);
                res.locals.depositContract.beaconchain_distribution = JSON.stringify(depositContract.lastState.beaconchain_distribution);
                res.locals.depositContract.unclaimedgno_distribution = JSON.stringify(depositContract.lastState.unclaimedgno_distribution); 
            } catch(e){
                console.error(e);
            }
            
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


exports.Keystores = function(req,res,next){
    res.locals.title = `Guide to generate abd deposit Validator keys for ${res.locals.chainName} staking`;
    res.locals.metaDescription = `Complete indotrduction to validator keystores for staking on ${res.locals.chainName} chain.`;
    res.locals.page_hbs = "guides/keystores";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "guides";
    next();
};


exports.CacheIndexData = function(cb){
    //console.log(`${new Date()} GnosisController.prototype.CacheIndexPageData`);

    var callbacks = 5;
    
    var vaultServicesData = null,
        validatorHostingServicesData = null,
        beaconData = null,
        chainData = null,
        valuationData = null,
        circulationData = null, // Circulation due to BuyBacks from API
        indicators = null,
        depositContract = null,
        valcount = null;

    fs.readFile(path.join(__dirname, '..', '..', dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
        if(!err) {
            try {
                const parsedChartsDataCache = JSON.parse(fileContent).gnosis;
                beaconData = parsedChartsDataCache.beaconData;
                chainData = parsedChartsDataCache.chainData;
                indicators = parsedChartsDataCache.indicators;
                valuationData = parsedChartsDataCache.valuationData;
                circulationData = parsedChartsDataCache.circulationData;
                valcount = parsedChartsDataCache.valcount;
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
        fs.writeFile(path.join(__dirname, '..', '..', dataFile.pagecache.validatorqueue.gnosis), JSON.stringify(chartData, null, 2), 'utf8', (err) => {
            if (err) console.error('Error writing file:', err);
            
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
            const divide = (dbData[i].GNO_validators > 10_000_000);
            let GNO_validators = dbData[i].GNO_validators,
                GNO_contract = dbData[i].GNO_contract,
                GNO_unclaimed = dbData[i].GNO_unclaimed,
                gno_balance = dbData[i].bilance;
            if(divide){
                GNO_validators = GNO_validators / 1e9;
                GNO_contract = GNO_contract / 1e9;
                GNO_unclaimed = GNO_unclaimed / 1e9;
                gno_balance = gno_balance / 1e9;
            }

            if(i === (marks - 1)){
                // last day
                depositContract.lastState.gno_validators = GNO_validators;
                depositContract.lastState.gno_contract = GNO_contract;
                depositContract.lastState.gno_unclaimed = GNO_unclaimed;
                depositContract.lastState.gno_balance = gno_balance;
                
                depositContract.lastState.epoch = dbData[i].epoch;
                
                depositContract.lastState.unclaimedgno_distribution.wallets_count = numeral(dbData[i].wallets).format('0,0');
                depositContract.lastState.beaconchain_distribution.validators_count = numeral(dbData[i].validators).format('0,0');

                // beaconchian holdings
                if(dbData[i].beaconchain_distribution){
                    const beaconchain_entries = Object.entries(dbData[i].beaconchain_distribution);
                    beaconchain_entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
                    depositContract.lastState.beaconchain_distribution.holdings = beaconchain_entries.map(entry => entry[0]);
                    depositContract.lastState.beaconchain_distribution.validators = beaconchain_entries.map(entry => entry[1]);
                }
                
                // unclaimed gno holdings
                if(dbData[i].unclaimed_distribution){
                    const unclaimedgno_entries = Object.entries(dbData[i].unclaimed_distribution);
                    unclaimedgno_entries.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
                    depositContract.lastState.unclaimedgno_distribution.holdings = unclaimedgno_entries.map(entry => entry[0]);
                    depositContract.lastState.unclaimedgno_distribution.wallets = unclaimedgno_entries.map(entry => entry[1]);
                }

            }

            depositContract.historicalChart.date.push(dbData[i].date);
            depositContract.historicalChart.gno_validators.push(GNO_validators);
            depositContract.historicalChart.gno_unclaimed.push(GNO_unclaimed);
            depositContract.historicalChart.gno_contract.push(GNO_contract);
            depositContract.historicalChart.gno_balance.push(gno_balance);
        }

        const days_count = depositContract.historicalChart.gno_balance.length;
        if(days_count >= 2){
            depositContract.lastState.gno_24h_difference = depositContract.historicalChart.gno_balance[days_count - 1] - depositContract.historicalChart.gno_balance[days_count - 2];
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

    // https get req from api → transform to getting from mysql
    

    // Get Vault services data
    // console.log("Getting vauld services:", vaultServicesData);
    fs.readFile(path.join(__dirname, '..', '..', dataFile.gnosis.vaultServices), 'utf8', (err, fileContent) => {
        if(!err) vaultServicesData = JSON.parse(fileContent);
        taskCompleted(err, "vaultServices");
    });

    // Get validator hosting services data
    fs.readFile(path.join(__dirname, '..', '..', dataFile.gnosis.validatorHostingServices), 'utf8', (err, fileContent) => {
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
            valuationData: valuationData,
            circulationData: circulationData,
            depositContract: depositContract,
            valcount
            /*,
            ethStore: new EthStoreData().ConvertToChartsArray(ethStoreData, -30)*/
        };

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