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
        router.get('/', Chain.Ethereum, this.chainController.Request, this.Response); // homepage

        router.get('/liquid-staking', Chain.Ethereum, this.chainController.RequestLiquid, this.Response); // homepage
        router.get('/validators-saas', Chain.Ethereum, this.chainController.RequestSaas, this.Response); // homepage
        router.get('/smoothing-pools', Chain.Ethereum, this.chainController.SmoothingPools, this.Response);
        router.get('/mev-relay-list', Chain.Ethereum, this.chainController.RelayList, this.Response);
        
        // topic-based
        router.get('/validators', Chain.Ethereum, this.chainController.Validators, this.Response);
        router.get('/keystores', Chain.Ethereum, this.chainController.Keystores, this.Response);
        router.get('/maintenance', Chain.Ethereum, this.GuidePage.Maintenance, this.Response);
        router.get('/emergency', Chain.Ethereum, this.GuidePage.Emergency, this.Response);
        router.get('/validator-queue', Chain.Ethereum, this.ValidatorQueue.Page, this.Response);

        router.get('/staking-hardware', Chain.Ethereum, this.GuidePage.Hardware, this.Response);
        router.get('/full-guide', Chain.Ethereum, this.GuidePage.Base, this.Response); // gudide - run execution and consensus layer clients
        router.get('/full-guide/solo', Chain.Ethereum, this.GuidePage.Solo, this.Response);
        router.get('/full-guide/rocketpool', Chain.Ethereum, this.GuidePage.Rocketpool, this.Response);
        router.get('/full-guide/stakewise', Chain.Ethereum, this.GuidePage.Stakewise, this.Response);
        router.get('/full-guide/lido', Chain.Ethereum, this.GuidePage.Lido, this.Response);
        router.get('/fundamentals', Chain.Ethereum, this.fundamentals.Request, this.Response); // fundamentals
        //router.get('/charts', Chain.Ethereum, this.ChartsPage.Request, this.ChartsPage.Response);
        router.get('/schema', Chain.Ethereum, this.StakingSchema.Request, this.Response);
        router.get('/clients', Chain.Ethereum, this.ClientsPage.ClientsOverview, this.Response);
        router.get('/news', Chain.Ethereum, this.NewsPage.Request, this.Response);
    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";
        //console.log(res.locals.page_hbs, "("+res.locals.layout_hbs+")")
        res.render(res.locals.page_hbs, {
            layout: res.locals.layout_hbs,
            pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
            alternateUrl: null,//alternateUrl,
            alternateLang: null,//req.appData.meta.alt.lang,
            lang: "en",//req.appData.meta.lang,
            js:null,//req.appData.meta.js,
            cssFile: res.locals.css_file,//req.appData.meta.css,
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