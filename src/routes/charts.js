"use strict";
const router = require('express').Router();
const GuidePageController = require('../controllers/guidePage')
const ChartsController = require('../controllers/charts');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');

class ChartsRouter {
    constructor(){
        this.GuidePage = new GuidePageController();
        this.StakingSchema = new StakingSchema();
        this.httpListener();
    }

    httpListener(){
        // Ethereum
        router.get('/ethereum-staking-apy', Chain.Ethereum, ChartsController.GetData, ChartsController.StakingApy, this.Response);
        router.get('/ethereum-validators', Chain.Ethereum, ChartsController.GetData, ChartsController.Validators, this.Response);
        router.get('/eth-staked', Chain.Ethereum, ChartsController.GetData, ChartsController.StakedTokens, this.Response);
        router.get('/ethereum-staking-tvl', Chain.Ethereum, ChartsController.GetData, ChartsController.TVL, this.Response);
        router.get('/eth-circulation-supply', Chain.Ethereum, ChartsController.GetData, ChartsController.CirculationSupply, this.Response);
        router.get('/ethereum-marketcap', Chain.Ethereum, ChartsController.GetData, ChartsController.MarketCap, this.Response);
        router.get('/ethereum-transactions', Chain.Ethereum, ChartsController.GetData, ChartsController.Transactions, this.Response);
        router.get('/ethereum-blocks', Chain.Ethereum, ChartsController.GetData, ChartsController.Blocks, this.Response);

        // Gnosis
        router.get('/gnosis-validators', Chain.Gnosis, ChartsController.GetData, ChartsController.Validators, this.Response);
        router.get('/gno-staked', Chain.Gnosis, ChartsController.GetData, ChartsController.StakedTokens, this.Response);
        router.get('/gno-circulation-supply', Chain.Gnosis, ChartsController.GetData, ChartsController.GnoCirculationSupply, this.Response);
        router.get('/gnosis-transactions', Chain.Gnosis, ChartsController.GetData, ChartsController.Transactions, this.Response);
        router.get('/gnosis-blocks', Chain.Gnosis, ChartsController.GetData, ChartsController.Blocks, this.Response);
    }

    Response(req, res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";

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
    }
}

new ChartsRouter();
module.exports = router;