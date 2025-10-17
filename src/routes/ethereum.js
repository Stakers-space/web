"use strict";
const router = require('express').Router();
const EthereumController = require('../controllers/ethereum.js');
const GuidePageController = require('../controllers/guidePage.js')
const StakingSchema = require('../controllers/stakingSchema.js');
const Chain = require('../middlewares/SetChain.js');
const NewsPageSchema = require('../controllers/newsPage.js');
const ClientsController = require('../controllers/clientPage.js');
const ValidatorQueueController = require('../controllers/validatorQueue.js');
const Explorer = require('../controllers/explorer.js');

class EthereumRouter {
    constructor(){
        this.GuidePage = new GuidePageController();
        this.StakingSchema = new StakingSchema();
        this.NewsPage = new NewsPageSchema();
        this.ClientsPage = new ClientsController();
        this.ValidatorQueue = new ValidatorQueueController();
        this.httpListener();
    }

    httpListener(){
        router.get('/', Chain.Ethereum, EthereumController.HOME, this.Response); // homepage staking
        router.get('/wallet/:path(*)?', Chain.Ethereum, Explorer.Wallet, this.Response);  // wallets explorer
        router.get('/validator/:path(*)?', Chain.Ethereum, Explorer.Validator, this.Response); // validator explorer
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