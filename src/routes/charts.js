"use strict";
const router = require('express').Router();
const GnosisController = require('../controllers/gnosis');
const GuidePageController = require('../controllers/guidePage')
const ChartsController = require('../controllers/charts');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');

class ChartsRouter {
    constructor(){
        this.chainController = new GnosisController();
        this.GuidePage = new GuidePageController();
        this.ChartsPage = new ChartsController();
        this.StakingSchema = new StakingSchema();
        this.httpListener();
    }

    httpListener(){
        // Ethereum
        router.get('/ethereum-staking-apy', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.StakingApy, this.Response);
        router.get('/ethereum-validators', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.Validators, this.Response);
        router.get('/eth-staked', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.StakedTokens, this.Response);
        router.get('/ethereum-staking-tvl', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.TVL, this.Response);
        router.get('/eth-circulation-supply', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.CirculationSupply, this.Response);
        router.get('/ethereum-marketcap', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.MarketCap, this.Response);
        router.get('/ethereum-transactions', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.Transactions, this.Response);
        router.get('/ethereum-blocks', Chain.Ethereum, this.ChartsPage.GetData, this.ChartsPage.Blocks, this.Response);

        // Gnosis
        router.get('/gnosis-validators', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.Validators, this.Response);
        router.get('/gno-staked', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.StakedTokens, this.Response);
        router.get('/gno-circulation-supply', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.GnoCirculationSupply, this.Response);
        router.get('/gnosis-transactions', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.Transactions, this.Response);
        router.get('/gnosis-blocks', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.Blocks, this.Response);
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