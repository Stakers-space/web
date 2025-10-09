"use strict";
var app = null;
const fs = require('fs'),
      path = require('path'),
      httpXmlModule = require('../utils/xmlhttps'),
      EthStoreDataModel = require('../models/ethstoretable.js'),
      EthBeaconChainData = require('../models/ethbeaconchaintable'),
      GnoBeaconChainData = require('../models/gnobeaconchaintable'),
      EtherchainData = require('../models/etherchaintable'),
      GnosischainData = require('../models/gnosischaintable'),
      CalculateTimeChange = require('../utils/get-time-difference'),
      numeral = require('numeral');
const azureCosmosDB = require('../services/azureCosmosDB'),
      MySqlService = require('../services/mysqlDB.js');

function ChartsPagePresenter(){ 
    this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    this.cachedDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.charts);
    app = this;
}

ChartsPagePresenter.prototype.GetData = function(req, res, next){
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

    var callbacks = 9;

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

    // valcount data
    azureCosmosDB.queryContainer("data",'SELECT TOP 1 c FROM c WHERE c.partitionKey = @partitionKey ORDER BY c._ts DESC', "eth-valcount", function(err,data){
        if(!err && data.length > 0) ethereum_srcData.valcount = data[0]?.c;
        //console.log("eth-valcount", ethereum_srcData.valcount);
        taskCompleted(err, "eth-valcount");
    });
    azureCosmosDB.queryContainer("data",'SELECT TOP 1 c FROM c WHERE c.partitionKey = @partitionKey ORDER BY c._ts DESC', "gno-valcount", function(err,data){
        if(!err && data.length > 0) gnosis_srcData.valcount = data[0]?.c;
        //console.log("gno-valcount", gnosis_srcData.valcount);
        taskCompleted(err, "gno-valcount");
    });

    // get ethstore data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "ethstore", function(err,data){
        if(!err) ethereum_srcData.storeData = data;
        taskCompleted(err, "ethstore");
    });

     // Get beaconchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "beaconchain", function(err,data){
        if(!err) ethereum_srcData.beaconData = data;
        taskCompleted(err, "beaconchain");
    });

    // Get etherchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "etherchain", function(err,data){
        if(!err) ethereum_srcData.chainData = data;
        taskCompleted(err, "etherchain");
    });
    
    // Get beaconchain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "gno-beaconchain", function(err,data){
        if(!err) gnosis_srcData.beaconData = data;
        taskCompleted(err, "beacon");
    });

    // Get gnosisChain data
    azureCosmosDB.queryContainer("data",'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days', "gnosischain", function(err,data){
        if(!err) gnosis_srcData.chainData = data;
        taskCompleted(err, "chain");
    });

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
            try {
                gnosis_srcData.circulationData = JSON.parse(jsonData).data;
            } catch(e){
                console.error("gnodashboard.azurewebsites.net/api/gnosis-overview", e);
                
                gnosis_srcData.circulationData = {
                    generalHealthOverview: {
                        "total_minted": 0,
                        "dao_gno_buyback": 0,
                        "dao_holdings": 0,
                        "outstanding_tokens": 0,
                        "marketCap": 0,
                        "bookValueRatio": 0,
                        "bookValueUsd": 0,
                        "formated": {
                          "bookValueUsd": "$ 0",
                          "marketCap": "$ 0",
                          "bookValueRatio": "0",
                          "outstanding_tokens": "0"
                        },
                        "gnoPrice": 0,
                        "gno_in_dao_holdings": 0
                      },
                    buybacks_sum: {
                        "gnoBought": "184,153",
                        "usdPaid": "$ 23,352,715"
                      },
                    buybacks: {
                        "src": {
                          "date": [
                            "2023-03-23",
                            "2023-04-18",
                            "2023-10-20",
                            "2023-10-20",
                            "2023-10-20",
                            "2023-10-25",
                            "2023-11-06",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-07",
                            "2023-11-08",
                            "2023-11-08",
                            "2023-11-08",
                            "2023-11-09",
                            "2023-11-09",
                            "2023-11-10",
                            "2023-11-10",
                            "2023-11-11",
                            "2023-11-12",
                            "2023-11-13",
                            "2023-11-13",
                            "2023-11-14",
                            "2023-11-14",
                            "2023-11-15",
                            "2023-11-16",
                            "2023-11-16",
                            "2023-11-17",
                            "2023-11-17",
                            "2023-11-20",
                            "2023-11-20",
                            "2023-11-21",
                            "2023-11-22",
                            "2023-11-24",
                            "2023-11-26",
                            "2023-11-27",
                            "2023-11-28",
                            "2023-11-29",
                            "2023-11-30",
                            "2023-12-01",
                            "2023-12-05",
                            "2023-12-08",
                            "2023-12-13",
                            "2024-02-05",
                            "2024-02-05",
                            "2024-02-05",
                            "2024-02-05",
                            "2024-02-13",
                            "2024-02-13",
                            "2024-02-13",
                            "2024-02-20",
                            "2024-02-20",
                            "2024-02-21",
                            "2024-02-26",
                            "2024-02-26",
                            "2024-03-05",
                            "2024-03-07",
                            "2024-03-07",
                            "2024-03-07",
                            "2024-03-19",
                            "2024-03-19",
                            "2024-04-03",
                            "2024-04-11",
                            "2024-04-12",
                            "2024-05-14",
                            "2024-06-11",
                            "2024-06-18",
                            "2024-06-18",
                            "2024-06-27",
                            "2024-06-27"
                          ],
                          "gnoBought": [
                            640,
                            3950,
                            28999.67,
                            28999.67,
                            28999.67,
                            6651.61,
                            926.1,
                            830.35,
                            1310.67,
                            1424.67,
                            1415.87,
                            822.91,
                            643.35,
                            1240.61,
                            883.53,
                            304.87,
                            644.63,
                            581.2,
                            586.09,
                            748.13,
                            754.12,
                            584.58,
                            742.25,
                            591.49,
                            754.12,
                            620.05,
                            630.82,
                            644.38,
                            633.47,
                            394.92,
                            386.21,
                            645.24,
                            485.08,
                            249.73,
                            456.48,
                            462.33,
                            337.2,
                            451.09,
                            358.24,
                            564.06,
                            473.69,
                            720.28,
                            358.72,
                            486.29,
                            563.17,
                            460.95,
                            856.09,
                            573.37,
                            1717.22,
                            1180.59,
                            1912.18,
                            2192.09,
                            2110,
                            1620.26,
                            524.78,
                            2179.88,
                            274.7730221,
                            14850,
                            15000,
                            1102.32,
                            1297.908698,
                            1102.32,
                            132.3258649,
                            202.0485204,
                            450.0052175,
                            551.6225731,
                            1277.32852,
                            953.5517167,
                            4402.429614,
                            936.839847,
                            654.8356826,
                            986.6113839,
                            699.0324517
                          ],
                          "usdPaid": [
                            68952,
                            472722.57,
                            2871992.68,
                            2871992.68,
                            2871992.68,
                            699889,
                            103574.87,
                            101841.92,
                            160753.77,
                            182186.71,
                            181061.47,
                            105233.18,
                            82271.12,
                            166081.07,
                            122880.67,
                            42401.19,
                            92065.95,
                            84402.54,
                            87415.44,
                            115481.39,
                            116405.26,
                            89405.33,
                            112198.42,
                            91817.68,
                            117061.34,
                            100689.84,
                            102439,
                            111426.03,
                            112471.74,
                            70118.15,
                            65606.04,
                            109606.7,
                            89395.99,
                            46022.28,
                            86909.32,
                            88245.56,
                            68113.82,
                            90236.31,
                            59508.88,
                            108976.35,
                            89897.38,
                            144056,
                            69527.69,
                            95472.73,
                            130509,
                            103031.42,
                            186498.13,
                            124907.8,
                            374096.38,
                            257191.69,
                            488046.54,
                            559487.13,
                            538535.3,
                            492444.74,
                            159496.39,
                            682847.41,
                            111694,
                            164526,
                            159890,
                            444764.13,
                            559790,
                            444764.13,
                            45067,
                            67701,
                            160234,
                            220167,
                            443480,
                            310712,
                            1403094,
                            297015,
                            203579,
                            296474.4,
                            201870.47
                          ],
                          "gnoPrice_calc": [
                            107.7375,
                            119.67660000000001,
                            99.03535729889342,
                            99.03535729889342,
                            99.03535729889342,
                            105.22099160955017,
                            111.83983371126227,
                            122.64938881194676,
                            122.65007210052872,
                            127.8799371082426,
                            127.88001017042527,
                            127.87933066799528,
                            127.87925701406698,
                            133.87049112936378,
                            139.0792276436567,
                            139.07957490077737,
                            142.81983463382096,
                            145.2211631108052,
                            149.15019877493216,
                            154.36005774397498,
                            154.35906752241021,
                            152.93942659687295,
                            151.1598787470529,
                            155.23116198076045,
                            155.22906168779505,
                            162.3898717845335,
                            162.39022225040424,
                            172.9197523200596,
                            177.54864476612943,
                            177.5502633444748,
                            169.87141710468399,
                            169.86966090137003,
                            184.29123031252578,
                            184.28815120329958,
                            190.39020329477742,
                            190.87136893560876,
                            201.99827995255043,
                            200.04059056950942,
                            166.11456007146046,
                            193.19992553983622,
                            189.78103823175496,
                            200,
                            193.82161574487066,
                            196.32879557465708,
                            231.73997194452832,
                            223.51973099034603,
                            217.84874253875176,
                            217.84850968833388,
                            217.8500017470097,
                            217.85013425490646,
                            255.23043855703958,
                            255.22999968067003,
                            255.23000000000002,
                            303.9294557663585,
                            303.930008765578,
                            313.25,
                            406.49551089972164,
                            11.079191919191919,
                            10.659333333333333,
                            403.4800511648161,
                            431.3015244158569,
                            403.4800511648161,
                            340.5758959826757,
                            335.0729808165425,
                            356.0714271051757,
                            399.1261611407759,
                            347.19337512326115,
                            325.84703541334414,
                            318.70901366329036,
                            317.03924737095434,
                            310.8856243015001,
                            300.49764764324857,
                            288.7855485236266
                          ],
                          "gnoPrice_bfr": [
                            107.7375,
                            119.67660000000001,
                            99.03535729889342,
                            99.03535729889342,
                            99.03535729889342,
                            105.22099160955017,
                            "111.84",
                            "122.65",
                            "122.65",
                            "127.88",
                            "127.88",
                            "127.88",
                            "127.88",
                            "133.87",
                            "139.08",
                            "139.08",
                            "142.82",
                            "145.22",
                            "149.15",
                            "154.36",
                            "154.36",
                            "152.94",
                            "151.16",
                            "155.23",
                            "155.23",
                            "162.39",
                            "162.39",
                            "172.92",
                            "177.55",
                            "177.55",
                            "169.87",
                            "169.87",
                            "184.29",
                            "184.29",
                            "190.39",
                            "190.87",
                            "202.00",
                            "200.04",
                            "201.00",
                            "193.20",
                            "189.78",
                            "199.63",
                            "193.82",
                            "196.33",
                            "231.74",
                            "223.52",
                            "217.85",
                            "217.85",
                            "217.85",
                            "217.85",
                            "255.23",
                            "255.23",
                            "255.23",
                            "303.93",
                            "303.93",
                            "313.25",
                            "351.28",
                            "351.28",
                            "399.64",
                            "395.50",
                            "395.50",
                            "395.50",
                            "330.06",
                            "330.06",
                            "333.47",
                            "366.44",
                            "370.11",
                            "284.23",
                            "353.34",
                            "320.15",
                            "320.15",
                            "283.79",
                            "283.79"
                          ],
                          "market": [
                            "otc",
                            "otc",
                            "otc",
                            "otc",
                            "otc",
                            "otc",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm",
                            "otm"
                          ],
                          "tx_links": [
                            "https://etherscan.io/tx/0xa3a54c5661eea2185e4704270bc80d00d08475e58453de51e05cf47e2206a29d",
                            "https://etherscan.io/tx/0x45c58b5fb036c517a5ca26e3b684bb4bd48a70876ce60d9b56a96ee4711b4bf3",
                            "https://etherscan.io/tx/0x2d735d719ab46fac131fa2810d5f417a29b53667fc89e15fe7d01c6fdf9b52d4",
                            "https://etherscan.io/tx/0x5649869dfdaa1ca196d5cf8f89518c020f1cf0417e00a3dadd1470856e26e7d5",
                            "https://etherscan.io/tx/0x8aaf5360907c0195c7e1ba377db4395b83e0c35f2440bae18d41bdf5a580df3a",
                            "https://explorer.cow.fi/orders/0xc65cd092b367040690d8266ccb170a16c01d0de02eaf6c9ad235d7c5c911137b849d52316331967b6ff1198e5e32a0eb168d039d65424ced?tab=overview",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993",
                            "https://etherscan.io/tx/0xd9412a3488a99eddbedbe1cc9345262f70587caa877719f1bf642f82502dc993"
                          ],
                          "shares_outstanding": [
                            1694057.32878054,
                            1690107.32878054,
                            1661107.65878054,
                            1632107.9887805402,
                            1603108.3187805403,
                            1596456.7087805402,
                            1595530.60878054,
                            1594700.25878054,
                            1593389.58878054,
                            1591964.91878054,
                            1590549.04878054,
                            1589726.13878054,
                            1589082.78878054,
                            1587842.17878054,
                            1586958.6487805399,
                            1586653.7787805398,
                            1586009.1487805399,
                            1585427.94878054,
                            1584841.8587805398,
                            1584093.72878054,
                            1583339.6087805398,
                            1582755.0287805398,
                            1582012.7787805398,
                            1581421.2887805398,
                            1580667.1687805397,
                            1580047.1187805396,
                            1579416.2987805395,
                            1578771.9187805397,
                            1578138.4487805397,
                            1577743.5287805398,
                            1577357.3187805398,
                            1576712.0787805398,
                            1576226.9987805397,
                            1575977.2687805397,
                            1575520.7887805398,
                            1575058.4587805397,
                            1574721.2587805397,
                            1574270.1687805397,
                            1573911.9287805397,
                            1573347.8687805396,
                            1572874.1787805397,
                            1572153.8987805396,
                            1571795.1787805397,
                            1571308.8887805396,
                            1570745.7187805397,
                            1570284.7687805397,
                            1569428.6787805397,
                            1568855.3087805395,
                            1567138.0887805396,
                            1565957.4987805395,
                            1564045.3187805396,
                            1561853.2287805395,
                            1559743.2287805395,
                            1558122.9687805395,
                            1557598.1887805394,
                            1555418.3087805395,
                            1555143.5357584395,
                            1540293.5357584395,
                            1525293.5357584395,
                            1524191.2157584394,
                            1522893.3070604394,
                            1521790.9870604393,
                            1521658.6611955394,
                            1521456.6126751394,
                            1521006.6074576394,
                            1520454.9848845394,
                            1519177.6563645394,
                            1518224.1046478394,
                            1513821.6750338394,
                            1512884.8351868393,
                            1512229.9995042393,
                            1511243.3881203393,
                            1510544.3556686393
                          ],
                          "buyback_share_ratio": [
                            0.03777912288604195,
                            0.2337129679716871,
                            1.745803160120842,
                            1.776822992066085,
                            1.8089650998791895,
                            0.4166483164508018,
                            0.05804338662658536,
                            0.05206934628799552,
                            0.08225671921222279,
                            0.08949129363298473,
                            0.08901768864566201,
                            0.05176426177600907,
                            0.04048561878224771,
                            0.07813182044029,
                            0.05567441852873277,
                            0.019214651871583166,
                            0.040644784457621,
                            0.03665887184889357,
                            0.036980976792912845,
                            0.047227634729412264,
                            0.04762844280645578,
                            0.03693433218470956,
                            0.04691807866255969,
                            0.03740243059811771,
                            0.04770896839603444,
                            0.039242500595713034,
                            0.039940071562326755,
                            0.0408152686486675,
                            0.040140331191442384,
                            0.025030684188908654,
                            0.024484623452254956,
                            0.040923134203363326,
                            0.030774755182805896,
                            0.015846040735932453,
                            0.02897327685236814,
                            0.02935319622091681,
                            0.02141331350674257,
                            0.028653912711146846,
                            0.022761121092560933,
                            0.035850939972810206,
                            0.030116204232385275,
                            0.04581485314883574,
                            0.022822312018943147,
                            0.030948084330980882,
                            0.03585367085623644,
                            0.02935454824273479,
                            0.05454787538769775,
                            0.03654702870245419,
                            0.10957681472321598,
                            0.0753909349978759,
                            0.12225860574749173,
                            0.14035185634642097,
                            0.13527867671204252,
                            0.10398794141826251,
                            0.03369161596232055,
                            0.1401475080815426,
                            0.017668659887782892,
                            0.964101949092961,
                            0.9834172667978545,
                            0.0723216344906885,
                            0.08522650221014397,
                            0.07243570302182506,
                            0.008696159544482466,
                            0.01327993967864408,
                            0.029586013321282224,
                            0.03628009895616141,
                            0.08408025978059108,
                            0.06280704632345313,
                            0.2908156017716941,
                            0.06192406885249144,
                            0.04330265123788561,
                            0.06528474444656672,
                            0.04627685702023458
                          ]
                        },
                        "agg": {
                          "quarter": [
                            "1/2023",
                            "2/2023",
                            "4/2023",
                            "1/2024",
                            "2/2024"
                          ],
                          "gnoBought": [
                            "640",
                            "3,950",
                            "119,823",
                            "48,828",
                            "10,912"
                          ],
                          "usdPaid": [
                            "$ 68,952",
                            "$ 472,723",
                            "$ 13,412,667",
                            "$ 5,861,748",
                            "$ 3,536,626"
                          ],
                          "gnoPrice_calc": [
                            "$ 108",
                            "$ 120",
                            "$ 112",
                            "$ 120",
                            "$ 324"
                          ],
                          "gnoPrice_bfr": [],
                          "shares_outstanding": [
                            1694057.32878054,
                            1690107.32878054,
                            1570284.7687805397,
                            1521456.6126751394,
                            1510544.3556686393
                          ],
                          "buyback_share_ratio": [
                            0.03777912288604195,
                            0.2337129679716871,
                            7.630626137515964,
                            3.209303222886302,
                            0.7224055993820659
                          ],
                          "purchases": [
                            1,
                            1,
                            44,
                            18,
                            9
                          ]
                        },
                        "sum": {
                          "gnoBought": "184,153",
                          "usdPaid": "$ 23,352,715"
                        }
                      }
                };
            }
        }
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
            ethStore: new EthStoreDataModel().ConvertToChartsArray(ethereum_srcData.storeData, 0),
            valcount: ethereum_srcData.valcount
        };

        const gnosis_arrData = {
            beaconData: new GnoBeaconChainData().ConvertToChartsArray(gnosis_srcData.beaconData, 0),
            chainData: new GnosischainData().ConvertToChartsArray(gnosis_srcData.chainData, 0),
            valuationData: gnosis_srcData.valuationData,//,
            //circulationData: gnosis_srcData.circulationData
            valcount: gnosis_srcData.valcount
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

        
        /*let tgl= 0;
        index = -1;
        while (tgl !== 0) {
            tvlGno = gnosis_arrData.beaconData.tvl.slice(index)[0];
            if (!tgl) {
                console.log(`Warn: No tvlGno value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }*/

        var aggregaredData = {
            ethereum: {
                beaconData: ethereum_arrData.beaconData,
                chainData: ethereum_arrData.chainData,
                ethStore: ethereum_arrData.ethStore,
                indicators: {
                    aprLastDay: new EthStoreDataModel().GetApr(ethereum_arrData.ethStore.apr[ethereum_arrData.ethStore.apr.length - 1]),
                    validators: {
                        count: numeral(ethereum_arrData.beaconData.validators[ethereum_arrData.beaconData.validators.length - 1]).format('0,0'),
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.validators, '0,0')
                    },
                    stakedTokens: {
                        value: stakedEth,
                        hr_value: numeral(stakedEth).format('0.00a'),
                        supplyShare: numeral(ethereum_arrData.beaconData.stakedTokens[ethereum_arrData.beaconData.stakedTokens.length - 1] / ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1]).format('0.00%'),
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.stakedTokens, '0,0')
                    },
                    tvl: {
                        value: tvlEth,
                        value_hr: numeral(tvlEth).format('$0.00a'),
                        increments: CalculateTimeChange(ethereum_arrData.beaconData.tvl, '$0,0')
                    },
                    supply: {
                        value: numeral(ethereum_arrData.chainData.totalSupply[ethereum_arrData.chainData.totalSupply.length - 1]).format('0.00a'),
                        increments: CalculateTimeChange(ethereum_arrData.chainData.totalSupply, '0,0')
                    }
                }
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
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.stakedTokens, '0,0'),
                        hr_value: numeral(stakedGno).format('0.00a')
                    },
                    tvl: {
                        value: stakedGno * gnosis_srcData.valuationData?.gnoPrice,
                        value_hr: numeral(stakedGno * gnosis_srcData.valuationData.gnoPrice).format('$0.00a')/*,
                        increments: CalculateTimeChange(gnosis_arrData.beaconData.tvl, '$0,0')*/
                    },
                    supply: {
                        value: gnosis_srcData.circulationData.generalHealthOverview.outstanding_tokens,//0,//gnosis_srcData.gnovaluationData.generalHealthOverview.outstanding_tokens,
                        value_formated: gnosis_srcData.circulationData.generalHealthOverview.formated.outstanding_tokens
                    }
                }
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