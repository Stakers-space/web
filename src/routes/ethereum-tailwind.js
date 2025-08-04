"use strict";
const router = require('express').Router();
const EthereumController = require('../controllers/ethereum');
const GuidePageController = require('../controllers/guidePage')
const FundamentalsController = require('../controllers/fundamentalsPage');
const ChartsController = require('../controllers/charts');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');
const NewsPageSchema = require('../controllers/newsPage');
const ClientsController = require('../controllers/clientPage');
const ValidatorQueueController = require('../controllers/validatorQueue');

class EthereumRouter {
    constructor(){
        this.chainController = new EthereumController();
        this.GuidePage = new GuidePageController();
        this.fundamentals = new FundamentalsController();
        this.ChartsPage = new ChartsController();
        this.StakingSchema = new StakingSchema();
        this.NewsPage = new NewsPageSchema();
        this.ClientsPage = new ClientsController();
        this.ValidatorQueue = new ValidatorQueueController();
        this.httpListener();
    }

    httpListener(){
        router.get('/', Chain.Ethereum, this.chainController.Request, this.Response); // homepage staking

    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";
        //console.log(res.locals.page_hbs, "("+res.locals.layout_hbs+")")
        res.render("ethereum/index", {
            layout: res.locals.layout_hbs,
            pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
            alternateUrl: null,//alternateUrl,
            alternateLang: null,//req.appData.meta.alt.lang,
            lang: "en",//req.appData.meta.lang,
            js:null,//req.appData.meta.js,
            cssFile: "chainpage",//res.locals.css_file,//req.appData.meta.css,
            //chain: res.locals.chain,
            //chainData: res.locals.chainData,
            //executionClients: res.locals.executionClients,
            //consensusCLients: res.locals.consensusClients,
            pathUrl: req.originalUrl,
            helpers: {}
        });
    }
}

new EthereumRouter();
module.exports = router;