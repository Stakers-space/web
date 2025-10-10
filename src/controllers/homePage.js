"use strict";
var app = null;
const fs = require('fs'),
      path = require('path');//,
	  //azureCosmosDB = require('../services/azureCosmosDB');
const EthStoreData = require('../models/ethstoretable');
const cache_assetPrice = require('../middlewares/cache/asset-price.js'); 

function HomePagePresenter(){
	this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    
    this.cachedDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.hp);
    this.newsDataFile = path.join(__dirname, '..', '..',  this.dataFile.pagecache.news.hp)

    app = this;
}

HomePagePresenter.prototype.Request = function(req,res, next){
    res.locals.title = `Stakers.space | All around Staking at one place.`;
    res.locals.metaDescription = `Stakers.space is a space full of guides, tools and advices targeted at staking enthusiasts as well as professionals. `;

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
		//title: "Stakers.space",//req.appData.meta.title,
		//metaDescription: null,//req.appData.meta.meta_desc,
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

        const {eth_usd, gno_usd} = cache_assetPrice.Get();
        const stakedEth = ethereumData.valcount.total.effective_balance;
        const stakedGno = gnosisData.valcount.total.effective_balance;

        var aggregaredData = {
            ethereum: {
                price: eth_usd,
                apr: new EthStoreData().GetApr(ethereumData.ethStore.apr.slice(-1)[0]),
                validators: ethereumData.valcount.stateCount.active_ongoing.validators,
                tvl: stakedEth * eth_usd,
                stakedRatio: stakedEth / ethereumData.chainData.totalSupply.slice(-1)[0]
            },
            gnosis: {
                price: gno_usd,
                apr: new EthStoreData().GetApr(0 * 100),
                validators: gnosisData.valcount.stateCount.active_ongoing.validators,
                tvl: stakedGno * gno_usd,
                stakedRatio: stakedGno / gnosisData.indicators.supply.value
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