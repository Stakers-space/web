"use strict";
var app = null;
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

const assetPriceCache = require('../middlewares/cache/asset-price.js'); 

function ChartsPagePresenter(){ 
    this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    this.cachedDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.charts);
    app = this;
}

ChartsPagePresenter.prototype.GetData = function(req, res, next){
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
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

ChartsPagePresenter.prototype.GnoCirculationSupply = function(req,res,next){
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

ChartsPagePresenter.prototype.Validators = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chartId = 'ethvalidators_chart';
    res.locals.jsController = 'validators';
    res.locals.title = `${res.locals.chainName} Validators count`;
    res.locals.metaDescription = `View current and historical validators count on ${res.locals.chainName} chain.`;
    next();
};

ChartsPagePresenter.prototype.StakingApy = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.ethStoreData = JSON.stringify(parsedData.ethStore);
    res.locals.chartId = 'ethstakingapr_chart';
    res.locals.jsController = 'eth-stakingapr';
    res.locals.title = `${res.locals.chainName} Staking APR`;
    res.locals.metaDescription = `View current and historical ${res.locals.chainName} Staking APRs`;
    next();
};
ChartsPagePresenter.prototype.StakedTokens = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'stakedbalance_chart';
    res.locals.jsController = 'staked-balance';
    res.locals.title = `Amount of staked ${res.locals.chainTokenUpr} on ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical amount of staked ${res.locals.chainTokenUpr} on ${res.locals.chainName} chain.`;
    next();
};
ChartsPagePresenter.prototype.TVL = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'tvlbalance_chart';
    res.locals.jsController = 'tvl-balance';
    res.locals.title = `Total value locked (TVL) in ${res.locals.chainName} staking`;
    res.locals.metaDescription = `View total current and historical value locked (TVL) in ${res.locals.chainName} staking`;
    next();
};
ChartsPagePresenter.prototype.CirculationSupply = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'ethsupply_chart';
    res.locals.jsController = 'supply';
    res.locals.title = `Circulation supply on ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical circulation supply on ${res.locals.chainName} chain.`;
    next();
};
ChartsPagePresenter.prototype.MarketCap = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'marketcap_chart';
    res.locals.jsController = 'marketcap';

    res.locals.title = `${res.locals.chainTokenUpr} token Market Cap`;
    res.locals.metaDescription = `View current and historical ${res.locals.chainTokenUpr} token Market Cap.`;
    next();
};
ChartsPagePresenter.prototype.Transactions = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'transactions_chart';
    res.locals.jsController = 'transactions';

    res.locals.title = `Transactions chart for ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical numbers of transactions on ${res.locals.chainName} chain.`;
    next();
};
ChartsPagePresenter.prototype.Blocks = function(req,res,next){
    const parsedData = (res.locals.chain === "gnosis") ? res.locals.parsedData.gnosis : res.locals.parsedData.ethereum;
    res.locals.beaconData = JSON.stringify(parsedData.beaconData);
    //res.locals.chainData = JSON.stringify(parsedData.chainData);
    res.locals.chartId = 'blocks_chart';
    res.locals.jsController = 'blocks';

    res.locals.title = `Blocks chart for ${res.locals.chainName} chain`;
    res.locals.metaDescription = `View current and historical numbers of blocks on ${res.locals.chainName} chain.`;
    next();
};

ChartsPagePresenter.prototype.Response = function(req,res){   
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


ChartsPagePresenter.prototype.CacheData = function(cb){
    //console.log(`${new Date()} GnosisController.prototype.CacheIndexPageData`);

    var callbacks = 4;

    var ethereum_srcData = {
        storeData: null,
        beaconData: null,
        chainData: null,
        valcount: null
    };
    var gnosis_srcData = {
        beaconData: null,
        chainData: null,
        valuationData: null,
        circulationData: null,
        valcount: null
    };

    const qc = (containerId, query, partitionKey) => new Promise((resolve, reject) => {
        azureCosmosDB.queryContainer(containerId, query, partitionKey, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
    const getLast = (pk) => qc("data", "SELECT TOP 1 VALUE c FROM c WHERE c.partitionKey = @partitionKey ORDER BY c._ts DESC", pk).then(rows => rows?.[0] ?? null);
    const getAllByDays = (pk) => qc("data", "SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days", pk);

    const jobs = [
        // valcount data
        getLast("eth-valcount").then(doc => { if (doc) ethereum_srcData.valcount = doc; }).catch(err => { console.error(err)}),
        getLast("gno-valcount").then(doc => { if (doc) gnosis_srcData.valcount = doc; }).catch(err => { console.error(err)}),
        
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
    assetPriceCache.UpdatePrice().then(resp => { taskCompleted(null, "assetPriceCache"); }).catch(err => { return taskCompleted(err, "assetPriceCache"); })

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
        let stakedEth;
        let index = -1;
        while (!stakedEth) {
            stakedEth = ethereum_arrData.beaconData.stakedTokens.slice(index)[0];
            if (!stakedEth) {
                console.log(`Warn: No stakedEth value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }

        let tvlEth = 0;
        index = -1;
        while (tvlEth === 0) {
            tvlEth = ethereum_arrData.beaconData.tvl.slice(index)[0];
            if (tvlEth === 0) {
                console.log(`Warn: No tvlEth value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }

        // Gnosis        
        let stakedGno;
        index = -1;
        while (!stakedGno) {
            stakedGno = gnosis_arrData.beaconData.stakedTokens.slice(index)[0];
            if (!stakedGno) {
                console.log(`Warn: No stakedGno value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }

        var aggregaredData = {
            ethereum: {
                beaconData: ethereum_arrData.beaconData,
                chainData: ethereum_arrData.chainData,
                ethStore: ethereum_arrData.ethStore,
                indicators: {
                    aprLastDay: new EthStoreDataModel().GetApr(ethereum_arrData.ethStore.apr[ethereum_arrData.ethStore.apr.length - 1]),
                    validators: {
                        count: ethereum_arrData.beaconData.validators[ethereum_arrData.beaconData.validators.length - 1],
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.validators, '0,0')
                    },
                    stakedTokens: {
                        value: stakedEth,
                        supplyShare: numeral(ethereum_arrData.beaconData.stakedTokens[ethereum_arrData.beaconData.stakedTokens.length - 1] / ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1]).format('0.00%'),
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.stakedTokens, '0,0')
                    },
                    tvl: {
                        value: tvlEth,
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.tvl, '$0,0')
                    },
                    supply: {
                        value: numeral(ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1]).format('0.00a'),
                        increments: CalculateTimeChange(ethereum_arrData.chainData.totalSupply, '0,0')
                    }
                },
                valcount: ethereum_srcData.valcount
            },
            gnosis: { 
                beaconData: gnosis_arrData.beaconData,
                chainData: gnosis_arrData.chainData,
                valuationData: gnosis_srcData.valuationData,
                circulationData: gnosis_srcData.circulationData,
                indicators: {
                    validators: {
                        value: numeral(gnosis_arrData.beaconData.validators[gnosis_arrData.beaconData.validators.length - 1]).format('0,0'),
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.validators, '0,0')
                    },
                    stakedTokens: {
                        value: stakedGno,
                        supplyShare: numeral(gnosis_arrData.beaconData.stakedTokens[gnosis_arrData.beaconData.stakedTokens.length - 1] / gnosis_srcData.circulationData.generalHealthOverview.outstanding_tokens).format('0.00%'),
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.stakedTokens, '0,0')
                    },
                    tvl: {
                        value: stakedGno * gnosis_srcData.valuationData?.gnoPrice/*,
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.tvl, '$0,0')*/
                    },
                    supply: {
                        value: gnosis_srcData.circulationData.generalHealthOverview.outstanding_tokens,//0,//gnosis_srcData.gnovaluationData.generalHealthOverview.outstanding_tokens,
                        value_formated: gnosis_srcData.circulationData.generalHealthOverview.formated.outstanding_tokens
                    }
                },
                valcount: gnosis_srcData.valcount
            }
        };

        // ToDo - manage +/- mark*/

        //aggregaredData.chartData = chartData;
        aggregaredData = JSON.stringify(aggregaredData, null, 2);

        // Post data to the file
        fs.writeFile(app.cachedDataFile, aggregaredData, 'utf8', (err) => {
            //if (!err) console.log('File successfully updated.');
            return cb(err);
        });
    }
};

// new ChartsPagePresenter().CacheData(function(err){ console.log(err, "data cached"); })

module.exports = ChartsPagePresenter;