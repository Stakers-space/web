"use strict";
var app = null;
const fs = require('fs'),
      path = require('path');//,
	  //azureCosmosDB = require('../services/azureCosmosDB');
const EthStoreData = require('../models/ethstoretable'),
      numeral = require('numeral');

function HomePagePresenter(){
	this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    
    this.cachedDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.hp);
    this.newsDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.news.hp)

    app = this;
}

HomePagePresenter.prototype.Request = function(req,res, next){
    var callbacks = 2;
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
        if(!err){
			const jsonData = JSON.parse(fileContent);
			res.locals.ethereum = jsonData.ethereum;
            res.locals.gnosis = jsonData.gnosis;
            taskCompleted(err);
		}
    });

	function taskCompleted(err){ callbacks--;
		if(err) {
			console.error(err);
		}
		if(callbacks === 0) next();
	}

};

HomePagePresenter.prototype.Response = function(req,res){
    res.render("hp", {
		layout: "standard",
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		title: "Stakers.space",//req.appData.meta.title,
		metaDescription: null,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		css:0,//req.appData.meta.css,
		cssFile:"hp",
		newsfeed: res.locals.newsfeed,
		helpers: {}
	});
};


// Process aggregation file
HomePagePresenter.prototype.CacheIndexData = function(cb){
    //console.log(`${new Date()} HomePagePresenter.prototype.CacheIndexPageData`);

    var callbacks = 1;
    var ethereumData = null;
    var gnosisData = null;
    
    fs.readFile(path.join(__dirname, '..', '..', app.dataFile.pagecache.charts), 'utf8', (err, fileContent) => {
        if(!err) {
            const parsedChartsDataCache = JSON.parse(fileContent);
            ethereumData = parsedChartsDataCache.ethereum;
            gnosisData = parsedChartsDataCache.gnosis;
        }
        taskCompleted(err, "chartsCache");
    });
    
	/**
	 * Ethereum
	 */
    // get ethstore data for apy
    /*azureCosmosDB.queryContainer("data",'SELECT TOP 1 * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days DESC', "ethstore", function(err,data){
        if(!err) ethStoreData = data[0];
        taskCompleted(err);
    });

     // Get beaconchain data for validators etc
    azureCosmosDB.queryContainer("data",'SELECT TOP 1 * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days DESC', "beaconchain", function(err,data){
        if(!err) beaconchainData = data[0];
        taskCompleted(err);
    });

	azureCosmosDB.queryContainer("data",'SELECT TOP 1 * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.days DESC', "etherchain", function(err,data){
        if(!err) etherchainData = data[0];
        taskCompleted(err);
    });*/
	// Get Ethereum chain data for...
	
    function taskCompleted(err){ callbacks--;
        if(err || callbacks !== 0) {
            if(err) console.error(err);
            return;
        }

		//console.log(ethStoreData, beaconchainData, etherchainData);
        const ethPrice = ethereumData.chainData.price.slice(-1)[0];
        let stakedEth;
        let index = -1;
        while (!stakedEth) {
            stakedEth = ethereumData.beaconData.stakedTokens.slice(index)[0];
            if (!stakedEth) {
                console.log(`Warn: No stakedEth value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }
        
        const gnoPrice = 0//;gnosisData.gnoDashboard.generalHealthOverview.gnoPrice;
        let stakedGno;
        index = -1;
        while (!stakedGno) {
            stakedGno = gnosisData.beaconData.stakedTokens.slice(index)[0];
            if (!stakedGno) {
                console.log(`Warn: No stakedGno value for day ${index} → Checking value in day ${index - 1}`);
                index--;
            }
        }
        //console.log("stakedRatio calc | stakedEth:", stakedEth, "ethPrice:");

        var aggregaredData = {
            ethereum: {
                price: numeral(ethPrice).format('$0,00'),
                apr: new EthStoreData().GetApr(ethereumData.ethStore.apr.slice(-1)[0]),
                validators: numeral(ethereumData.beaconData.validators.slice(-1)[0]).format('0,0'),
                tvl: numeral(stakedEth * ethPrice).format('$0.00a'),
                stakedRatio: numeral(stakedEth / ethereumData.chainData.totalSupply.slice(-1)[0]).format('0.00%') 
            },
            gnosis: {
                price: numeral(gnoPrice).format('$0,00'),
                apr: new EthStoreData().GetApr(0 * 100),
                validators: numeral(gnosisData.beaconData.validators.slice(-1)[0]).format('0,0'),
                tvl: numeral(stakedGno * gnoPrice).format('$0.00a'),
                stakedRatio: numeral(stakedGno / gnosisData.indicators.supply.value).format('0.00%')
            }
        }

        //console.log(aggregaredData);
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

module.exports = HomePagePresenter;

//new HomePagePresenter().CacheIndexData(function(err){console.log(err)});