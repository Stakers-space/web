"use strict";
const fs = require('fs'),
      path = require('path'),
      { getJson } = require('../libs/http-request.js'),
      EthStoreDataModel = require('../models/ethstoretable.js'),
      EthBeaconChainData = require('../models/ethbeaconchaintable'),
      GnoBeaconChainData = require('../models/gnobeaconchaintable'),
      EtherchainData = require('../models/etherchaintable'),
      GnosischainData = require('../models/gnosischaintable'),
      CalculateTimeChange = require('../utils/get-time-difference'),
      numeral = require('numeral');
const azureCosmosDB = require('../services/azureCosmosDB'),
      MySqlService = require('../services/mysqlDB.js');

const { validatorsViewChartConfig } = require('./chart_configs.js');
const { keepDayCloseMarksOnly } = require('../utils/reduceObjectArray.js');

const { ReadStateFiles } = require('../utils/filesystem-utils.js');
const ValidatorQueueModel = require('../models/validatorqueue');
const cache_validatorQueue = require('../middlewares/cache/validatorqueue');

const assetPriceCache = require('../middlewares/cache/asset-price.js'); 
const dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
const cachedDataFile = path.join(__dirname, '..', '..', dataFile.pagecache.charts);

exports.GetData = function(req, res, next){
    fs.readFile(path.join(__dirname, '..', '..', dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
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
            res.locals.valuationData = JSON.stringify(null);
            next();
        }
    });
};

exports.validators_overview = (req,res,next) => {
    res.locals.page_hbs = "shared_ethgno/validators";
    res.locals.layout_hbs = "standard";
    res.locals.css_file = "charts";
    res.locals.title = `Validator charts on ${res.locals.chainName} chain`;
    res.locals.metaDescription = `Charts related to validators on ${res.locals.chainName} chain`;

    // add validators and wallets snapshots data
    res.locals.walletsSnapshot = [];
    res.locals.walletsSnapshotDist = {};
    let tasks = 4;
    ReadStateFiles(dataFile.validatorWalletSnapshot, res.locals.chain)
    .then((data) => {
        const arrOrder = {
            pending_initialized: 2,
            pending_queued: 1,
            active_exiting: 3,
            active_ongoing: 0,
            exited_unslashed: 5,
            withdrawal_done: 4,
            withdrawal_possible: 6
        }
        // distribution - rounded Balance by number of wallets
         for(const stateResp of data){
            if(stateResp.error) continue;
            const stateData = stateResp.value;

            const walletsObj = stateData.json?.data || {};
            const rows = Object.entries(walletsObj).map(([address, v]) => ({
                address,
                balance: Number(v?.balance ?? 0),
                validatorsCount: Array.isArray(v?.validators) ? v.validators.length : 0,
                unclaimed: Number(v?.unclaimed_balance ?? 0),
            }));
            
            const topWlts = rows.sort((a, b) => b.balance - a.balance).slice(0, 10);

            const distMap = rows.reduce((acc, r) => {
                const bucket = (Math.round(r.balance/* * 10*/)/* / 10*/)/*.toFixed(1)*/;
                acc[bucket] = (acc[bucket] || 0) + 1;
                return acc;
            }, {});

            const entries = Object.entries(distMap)
            .map(([bucket, count]) => [parseFloat(bucket), Number(count)])
            .sort((a, b) => a[0] - b[0]);

            res.locals.walletsSnapshot[arrOrder[stateData.key]] = {
                key: stateData.key,
                epoch: stateData.json.epoch,
                topWlts
            };

            res.locals.walletsSnapshotDist[stateData.key] = {
                balance: entries.map(([bucket]) => bucket),
                wallets: entries.map(([, count]) => count),
            }
        }
        res.locals.walletsSnapshotDist = JSON.stringify(res.locals.walletsSnapshotDist);
        OnTaskCompleted();
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).send({ error: 'Something went wrong!' });
    });
    //const snapshots_validatorData = await ReadStateFiles(dataFile.validatorSnapshot, res.locals.chain);
    
    // validators count
    fs.readFile(path.join(__dirname, '..', '..', dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            res.locals.charts = {};
            res.locals.parsedData = JSON.parse(fileContent);
            // default values
            res.locals.ethStoreData = JSON.stringify(null);
            res.locals.beaconData = JSON.stringify(null);
            res.locals.chainData = JSON.stringify(null);
            res.locals.chartsUIconfig = JSON.stringify(null);
            res.locals.dashboardData = JSON.stringify(null);
            
            if(!res.locals.parsedData){
                console.error("Validators | res.locals.parsedData is null");
                return res.status(500).send({ error: 'Something went wrong!' });
            }
            const parsedData = res.locals.parsedData[res.locals.chain]; // chain selection
            res.locals.beaconData = JSON.stringify(parsedData.beaconData);
            res.locals.jsController = 'validators';
            
            res.locals.valcount = parsedData.valcount_history[parsedData.valcount_history.length - 1];
            //console.log("res.locals.valcount:", res.locals.valcount);
            const validatorsOverviewChart = validatorsViewChartConfig(res.locals.chainTokenUpr, parsedData.valcount_history);
            if(validatorsOverviewChart){
                 res.locals.charts['validators_overview'] = validatorsOverviewChart.overview;
                res.locals.charts['validators_overview'].syncScaleWith = 'validators_overview_diff';
                res.locals.charts['validators_overview_diff'] = validatorsOverviewChart.overview_diff;
                res.locals.charts['validators_overview_diff'].syncScaleWith = 'validators_overview';
            }
            res.locals.valcount_history = JSON.stringify(parsedData.valcount_history);
            OnTaskCompleted();
        }
    });

    // validator current queue
    fs.readFile(path.join(__dirname, '..', '..', dataFile[res.locals.chain].validatorQueue), 'utf8', (err, data) => {
        if(err){
            console.error(err);
            return res.status(500).send({ error: 'Something went wrong!' });
        } else {
            let model = new ValidatorQueueModel();
            res.locals.queue = model.GetSnapshot(cache_validatorQueue.getValidatorQueue(res.locals.chain), res.locals.chain, JSON.parse(data));
            //console.log("ETH | res.locals.queue:", res.locals.queue);
            OnTaskCompleted();
        }
    });
    
    // validator history queue
    fs.readFile(path.join(__dirname, '..', '..', dataFile.pagecache.validatorqueue[res.locals.chain]), 'utf8', (err, data) => {
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

exports.GnoCirculationSupply = function(req,res,next){
    const gnovaluationData = res.locals.parsedData.gnosis.gnoDashboard;
    console.log("GnoCirculationSupply | gnovaluationData:", gnovaluationData);
    res.locals.valuationData = JSON.stringify(gnovaluationData);
    res.locals.hbp = "chart_gno-buybacks";
    res.locals.chartId = 'buybacksupply_chart';
    res.locals.jsController = 'gno-supply';
    if(gnovaluationData){
        res.locals.overview = [
            `<h1>Overview</h1>`,
            `<strong>GNO Total Supply:</strong> ${numeral(gnovaluationData.generalHealthOverview.total_minted).format('0,0')} GNO`,
            `<div><strong>GNO in DAO holdings:</strong> ${numeral(gnovaluationData.generalHealthOverview.gno_in_dao_holdings).format('0,0')} GNO</div>`,
            `<div><strong>OutstandingGNO in circulation:</strong> ${numeral(gnovaluationData.generalHealthOverview.outstanding_tokens).format('0,0')} GNO</div>`
        ]
    } else {
        res.locals.overview = [];
    }
    next();
};

exports.Validators = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chartId = 'ethvalidators_chart';
    res.locals.jsController = 'validators';
    res.locals.title = `${res.locals.chainName} Validators count`;
    res.locals.metaDescription = `View current and historical validators count on ${res.locals.chainName} chain.`;
    next();
};

exports.StakingApy = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
    res.locals.chartId = 'ethstakingapr_chart';
    res.locals.jsController = 'eth-stakingapr';
    res.locals.title = `${res.locals.chainName} Staking APR`;
    res.locals.metaDescription = `View current and historical ${res.locals.chainName} Staking APRs`;
    next();
};
exports.StakedTokens = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'stakedbalance_chart';
    res.locals.jsController = 'staked-balance';
    res.locals.title = `Amount of staked ${res.locals.chainTokenUpr} on ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical amount of staked ${res.locals.chainTokenUpr} on ${res.locals.chainName} chain.`;
    next();
};
exports.TVL = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'tvlbalance_chart';
    res.locals.jsController = 'tvl-balance';
    res.locals.title = `Total value locked (TVL) in ${res.locals.chainName} staking`;
    res.locals.metaDescription = `View total current and historical value locked (TVL) in ${res.locals.chainName} staking`;
    next();
};
exports.CirculationSupply = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'ethsupply_chart';
    res.locals.jsController = 'supply';
    res.locals.title = `Circulation supply on ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical circulation supply on ${res.locals.chainName} chain.`;
    next();
};
exports.MarketCap = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'marketcap_chart';
    res.locals.jsController = 'marketcap';

    res.locals.title = `${res.locals.chainTokenUpr} token Market Cap`;
    res.locals.metaDescription = `View current and historical ${res.locals.chainTokenUpr} token Market Cap.`;
    next();
};
exports.Transactions = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'transactions_chart';
    res.locals.jsController = 'transactions';

    res.locals.title = `Transactions chart for ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical numbers of transactions on ${res.locals.chainName} chain.`;
    next();
};
exports.Blocks = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    //res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'blocks_chart';
    res.locals.jsController = 'blocks';

    res.locals.title = `Blocks chart for ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical numbers of blocks on ${res.locals.chainName} chain.`;
    next();
};

exports.Response = function(req,res){   
    res.render("chart", {
		layout: "standard",
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		//title: "Stakers.space",//req.appData.meta.title,
		//metaDescription: null,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		cssFile:"chain",//req.appData.meta.css,
		//client: res.locals.client,
		helpers: {}
	});
};


exports.CacheData = function(cb){
    //console.log(`${new Date()} GnosisController.prototype.CacheIndexPageData`);

    var callbacks = 4;

    var ethereum_srcData = {
        storeData: null,
        beaconData: null,
        chainData: null,
        valcount: null,
        valcount_history: null
    };
    var gnosis_srcData = {
        beaconData: null,
        chainData: null,
        valuationData: null,
        circulationData: null,
        valcount: null,
        valcount_history: null
    };

    let assetPrices = null;

    const qc = (containerId, query, partitionKey) => new Promise((resolve, reject) => {
        azureCosmosDB.queryContainer(containerId, query, partitionKey, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
    //const getLast = (pk) => qc("data", "SELECT TOP 1 VALUE c FROM c WHERE c.partitionKey = @partitionKey ORDER BY c._ts DESC", pk).then(rows => rows?.[0] ?? null);
    const getAllByDays = (pk) => qc("data", "SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days", pk);
    const getAllByTime = (pk) => qc("data", "SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.time", pk);

    const jobs = [
        // valcount data
        /*getLast("eth-valcount").then(doc => { if (doc) ethereum_srcData.valcount = doc; }).catch(err => { console.error(err)}),
        getLast("gno-valcount").then(doc => { if (doc) gnosis_srcData.valcount = doc; }).catch(err => { console.error(err)}),*/
        getAllByTime("eth-valcount").then(doc => { 
            if (doc) {
                ethereum_srcData.valcount = doc[doc.length - 1];
                ethereum_srcData.valcount_history = keepDayCloseMarksOnly(doc);
            }
        }).catch(err => { console.error(err)}),
        getAllByTime("gno-valcount").then(doc => { 
            if (doc) {
                gnosis_srcData.valcount = doc[doc.length - 1];
                gnosis_srcData.valcount_history = keepDayCloseMarksOnly(doc);
            }
        }).catch(err => { console.error(err)}),
        
        getAllByDays("ethstore").then(rows => { ethereum_srcData.storeData = rows; }).catch(err => { console.error(err)}),
        getAllByDays("beaconchain").then(rows => { ethereum_srcData.beaconData = rows; }).catch(err => { console.error(err)}),
        // Get etherchain data
        getAllByDays("etherchain").then(rows => { ethereum_srcData.chainData = rows; }).catch(err => { console.error(err)}),
        // Get beaconchain data
        getAllByDays("gno-beaconchain").then(rows => { gnosis_srcData.beaconData = rows; }).catch(err => { console.error(err)}),
        // Get gnosisChain data
        getAllByDays("gnosischain").then(rows => { gnosis_srcData.chainData = rows; }).catch(err => { console.error(err)}),
    ];

    Promise.allSettled(jobs).then((results) => {
        const firstErr = results.find(r => r.status === 'rejected')?.reason || null;
        taskCompleted(firstErr, "cosmosDB");
    });

    //assetPriceWorker.ActivateCron();
    assetPriceCache.UpdatePrice().then(resp => { assetPrices = resp; taskCompleted(null, "assetPriceCache"); }).catch(err => { return taskCompleted(err, "assetPriceCache"); })

    // Get Gnosis valuation_metrics data
    new MySqlService().GetValuationMetrics(500,function(err,data){
		if(err) return taskCompleted(err, "mysql-GetValuationMetrics");

        gnosis_srcData.valuationData = {};
        gnosis_srcData.valuationData.gnoPrice = [];
        gnosis_srcData.valuationData.bookValueTime = {
            date:[],
            book_ratio:[],
            market_cap:[],
            book_value:[],
            margin_of_safety: []
        }
        const dl = data.length;
        for(var i=0;i<dl;i++){
            const d = data[i];
            gnosis_srcData.valuationData.bookValueTime.date.push(d.datetime);
            gnosis_srcData.valuationData.bookValueTime.book_ratio.push(d.book_ratio);
            gnosis_srcData.valuationData.bookValueTime.margin_of_safety.push((1 - d.book_ratio) * 100);
            gnosis_srcData.valuationData.bookValueTime.market_cap.push(d.market_cap);
            gnosis_srcData.valuationData.bookValueTime.book_value.push(d.book_value);
            gnosis_srcData.valuationData.gnoPrice.push(d.gno_price);
        }
        taskCompleted(null, "mysql-GetValuationMetrics");
    });

    getJson(`https://gnodashboard.azurewebsites.net/api/gnosis-overview`)
    .then((resJson) => {
        gnosis_srcData.circulationData = resJson.data;
        taskCompleted(null, "gnodashboard api");
    })
    .catch(err => {
        console.error("gnodashboard.azurewebsites.net/api/gnosis-overview", err);
        gnosis_srcData.circulationData = require('../../data/cache/gnobuybacksFallback.js');
        taskCompleted(err, "gnodashboard api");
    });

    function taskCompleted(err, taskId){ callbacks--;
        //console.log(taskId, "task completed |", callbacks, err);
        if(err || callbacks !== 0) {
            if(err) console.error(err);
            return;
        }

        const ethereum_arrData = {
            beaconData: new EthBeaconChainData().ConvertToChartsArray(ethereum_srcData.beaconData, 0),
            chainData: new EtherchainData().ConvertToChartsArray(ethereum_srcData.chainData, 0),
            ethStore: new EthStoreDataModel().ConvertToChartsArray(ethereum_srcData.storeData, 0)
        };

        const gnosis_arrData = {
            beaconData: new GnoBeaconChainData().ConvertToChartsArray(gnosis_srcData.beaconData, 0),
            chainData: new GnosischainData().ConvertToChartsArray(gnosis_srcData.chainData, 0),
            valuationData: gnosis_srcData.valuationData//,
            //circulationData: gnosis_srcData.circulationData
        };

         // Ethereum
        const bcle = (ethereum_arrData.beaconData.stakedTokens.length <= ethereum_arrData.chainData.price.length) ? ethereum_arrData.beaconData.stakedTokens.length : ethereum_arrData.chainData.price.length;
        //console.log(bcle, ethereum_arrData.beaconData.stakedTokens, ethereum_arrData.chainData.price);
        for(var i=0; i<bcle;i++){
            const currentTVL = ethereum_arrData.beaconData.stakedTokens[i] * ethereum_arrData.chainData.price[i];
            //console.log(i, ethereum_arrData.beaconData.stakedTokens[i],"*",ethereum_arrData.chainData.price[i],"→",currentTVL);
            ethereum_arrData.beaconData.tvl_change.push(currentTVL - ((i===0) ? 0 : ethereum_arrData.beaconData.tvl[i - 1]));
            ethereum_arrData.beaconData.tvl.push(currentTVL);
        }

        const stakedEth = ethereum_srcData?.valcount?.stateCount?.active_ongoing?.eff_balance;
        const stakedGno = gnosis_srcData?.valcount?.stateCount?.active_ongoing?.eff_balance;
     
       // remove mid-items in ethereum_srcData.valcount_history, gnosis_srcData.valcount_history - keep only day-close marks

        var aggregaredData = {
            ethereum: {
                beaconData: ethereum_arrData.beaconData,
                chainData: ethereum_arrData.chainData,
                ethStore: ethereum_arrData.ethStore,
                indicators: {
                    aprLastDay: new EthStoreDataModel().GetApr(ethereum_arrData.ethStore.apr[ethereum_arrData.ethStore.apr.length - 1]),
                    validators: {
                        count: ethereum_srcData.valcount?.stateCount?.active_ongoing?.validators,
                        increments: CalculateTimeChange(ethereum_srcData.valcount_history, "active_ongoing.validators")
                    },
                    stakedTokens: {
                        value: stakedEth,
                        supplyShare: numeral(ethereum_arrData.beaconData.stakedTokens[ethereum_arrData.beaconData.stakedTokens.length - 1] / ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1]).format('0.00%'),
                        increments: CalculateTimeChange(ethereum_srcData.valcount_history, "active_ongoing.staked")
                    },
                    tvl: {
                        value: stakedEth * assetPrices.eth_usd,
                        //increments: CalculateTimeChange(ethereum_arrData.beaconData.tvl)
                    },
                    supply: {
                        value: ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1],
                        //increments: CalculateTimeChange(ethereum_arrData.chainData.totalSupply)
                    }
                },
                valcount: ethereum_srcData.valcount, // ?? duplicity
                valcount_history: ethereum_srcData.valcount_history
            },
            gnosis: { 
                beaconData: gnosis_arrData.beaconData,
                chainData: gnosis_arrData.chainData,
                valuationData: gnosis_srcData.valuationData,
                circulationData: gnosis_srcData.circulationData,
                indicators: {
                    validators: {
                        value: gnosis_srcData.valcount.stateCount.active_ongoing.validators,
                        increments: CalculateTimeChange(gnosis_srcData.valcount_history, "active_ongoing.validators")//CalculateTimeChange(gnosis_arrData.beaconData.validators)
                    },
                    stakedTokens: {
                        value: stakedGno,
                        supplyShare: gnosis_arrData.beaconData.stakedTokens[gnosis_arrData.beaconData.stakedTokens.length - 1] / gnosis_srcData.circulationData.generalHealthOverview.outstanding_tokens,
                        increments: CalculateTimeChange(gnosis_srcData.valcount_history, "active_ongoing.staked")//CalculateTimeChange(gnosis_arrData.beaconData.stakedTokens)
                    },
                    tvl: {
                        value: stakedGno * gnosis_srcData.valuationData?.gnoPrice/*,
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.tvl)*/
                    },
                    supply: {
                        value: gnosis_srcData.circulationData.generalHealthOverview.outstanding_tokens//0,//gnosis_srcData.gnovaluationData.generalHealthOverview.outstanding_tokens,
                    }
                },
                valcount: gnosis_srcData.valcount,
                valcount_history: gnosis_srcData.valcount_history
            }
        };

        // ToDo - manage +/- mark*/

        //aggregaredData.chartData = chartData;
        aggregaredData = JSON.stringify(aggregaredData, null, 2);

        // Post data to the file
        fs.writeFile(cachedDataFile, aggregaredData, 'utf8', (err) => {
            //if (!err) console.log('File successfully updated.');
            return cb(err);
        });
    }
};