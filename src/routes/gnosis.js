"use strict";
const router = require('express').Router();
const GnosisController = require('../controllers/gnosis');
const GuidePageController = require('../controllers/guidePage')
//const FundamentalsController = require('../controllers/fundamentalsPage');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');
const NewsPageController = require('../controllers/newsPage');
const ClientsController = require('../controllers/clientPage');
const ValidatorQueueController = require('../controllers/validatorQueue');
const Explorer = require('../controllers/explorer.js');

class GnosisRouter {
    constructor(){
        this.GuidePage = new GuidePageController();
        //this.fundamentals = new FundamentalsController();
        this.StakingSchema = new StakingSchema();
        this.NewsPage = new NewsPageController();
        this.ClientsPage = new ClientsController();
        this.ValidatorQueue = new ValidatorQueueController();
        this.httpListener();
    }

    httpListener(){
        router.get('/', Chain.Gnosis, GnosisController.HOME, this.Response); // homepage
        router.get('/wallet/:path(*)?', Chain.Gnosis, Explorer.Wallet, this.Response);  // wallets explorer
        router.get('/validator/:path(*)?', Chain.Gnosis, Explorer.Validator, this.Response); // validator explorer
    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";

        res.render("gnosis/index", {
            layout: res.locals.layout_hbs,
            pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
            alternateUrl: null,//alternateUrl,
            alternateLang: null,//req.appData.meta.alt.lang,
            lang: "en",//req.appData.meta.lang,
            js:null,//req.appData.meta.js,
            cssFile: res.locals.css_file,//req.appData.meta.css,
            chain: res.locals.chain,
            chainData: res.locals.chainData,
            executionClients: res.locals.executionClients,
            consensusCLients: res.locals.consensusClients,
            helpers: {}
        });
    }
}

new GnosisRouter();
module.exports = router;