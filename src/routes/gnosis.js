"use strict";
const router = require('express').Router();
const GnosisController = require('../controllers/gnosis');
const GuidePageController = require('../controllers/guidePage')
const FundamentalsController = require('../controllers/fundamentalsPage');
const ChartsController = require('../controllers/charts');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');
const NewsPageController = require('../controllers/newsPage');
const ClientsController = require('../controllers/clientPage');
const ValidatorQueueController = require('../controllers/validatorQueue');

class GnosisRouter {
    constructor(){
        this.chainController = new GnosisController();
        this.GuidePage = new GuidePageController();
        this.fundamentals = new FundamentalsController();
        this.ChartsPage = new ChartsController();
        this.StakingSchema = new StakingSchema();
        this.NewsPage = new NewsPageController();
        this.ClientsPage = new ClientsController();
        this.ValidatorQueue = new ValidatorQueueController();
        this.httpListener();
    }

    httpListener(){
        router.get('/', Chain.Gnosis, this.chainController.Request, this.Response); // homepage
        router.get('/liquid-staking', Chain.Gnosis, this.chainController.RequestLiquid, this.Response); // homepage
        router.get('/validators-saas', Chain.Gnosis, this.chainController.RequestSaas, this.Response); // homepage
        router.get('/validator-queue', Chain.Gnosis, this.ValidatorQueue.Page, this.Response);

        // topic-based
        router.get('/validators', Chain.Gnosis, this.chainController.Validators, this.Response);
        router.get('/deposit-contract-balance', Chain.Gnosis, this.chainController.DepositContract, this.Response);
        router.get('/keystores', Chain.Gnosis, this.chainController.Keystores, this.Response);
        router.get('/maintenance', Chain.Gnosis, this.GuidePage.Maintenance, this.Response);
        router.get('/emergency', Chain.Gnosis, this.GuidePage.Emergency, this.Response);
        router.get('/validator-actions', Chain.Gnosis, this.GuidePage.ValidatorActions, this.Response);

        router.get('/staking-hardware', Chain.Gnosis, this.GuidePage.Hardware, this.Response);
        router.get('/full-guide', Chain.Gnosis, this.GuidePage.Base, this.Response); // gudide - run execution and consensus layer clients
        router.get('/full-guide/solo', Chain.Gnosis, this.GuidePage.Solo, this.Response);
        router.get('/full-guide/stakewise', Chain.Gnosis, this.GuidePage.Stakewise, this.Response);
        router.get('/fundamentals', Chain.Gnosis, this.fundamentals.Request, this.Response); // fundamentals
        
        router.get('/schema', Chain.Gnosis, this.StakingSchema.Request, this.Response);
        router.get('/clients', Chain.Gnosis, this.ClientsPage.ClientsOverview, this.Response);
        // charts
        //router.get('/charts', Chain.Gnosis, this.ChartsPage.Request, this.ChartsPage.Response);
        router.get('/gno-circulation-supply', this.ChartsPage.GetData, this.ChartsPage.GnoCirculationSupply, this.ChartsPage.Response);
        router.get('/validators', Chain.Gnosis, this.ChartsPage.GetData, this.ChartsPage.Validators, this.ChartsPage.Response);
        router.get('/news', Chain.Gnosis, this.NewsPage.Request, this.Response);
    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";

        res.render(res.locals.page_hbs, {
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