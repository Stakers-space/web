"use strict";
const router = require('express').Router();
const GnosisController = require('../controllers/gnosis.js');
const GuidePageController = require('../controllers/guidePage.js')
//const FundamentalsController = require('../controllers/fundamentalsPage');
const StakingSchema = require('../controllers/stakingSchema.js');
const Chain = require('../middlewares/SetChain.js');
const NewsPageController = require('../controllers/newsPage.js');
const ClientsController = require('../controllers/clientPage.js');
const ValidatorQueueController = require('../controllers/validatorQueue.js');
const ChartsController = require('../controllers/charts.js');

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
        router.get('/', Chain.Gnosis, GnosisController.STAKING, this.Response); // homepage
        //router.get('/overview', Chain.Gnosis, GnosisController.OVERVIEW, this.Response); // staking network overview
        router.get('/liquid-staking', Chain.Gnosis, GnosisController.RequestLiquid, this.Response);
        router.get('/validators-saas', Chain.Gnosis, GnosisController.RequestSaas, this.Response);
        router.get('/validator-queue', Chain.Gnosis, this.ValidatorQueue.Page, this.Response);

        // topic-based
        router.get('/validators', Chain.Gnosis, ChartsController.validators_overview, this.Response);
        router.get('/deposit-contract-balance', Chain.Gnosis, GnosisController.DepositContract, this.Response);
        router.get('/keystores', Chain.Gnosis, GnosisController.Keystores, this.Response);
        router.get('/maintenance', Chain.Gnosis, this.GuidePage.Maintenance, this.Response);
        router.get('/emergency', Chain.Gnosis, this.GuidePage.Emergency, this.Response);
        router.get('/validator-actions', Chain.Gnosis, this.GuidePage.ValidatorActions, this.Response);

        router.get('/staking-hardware', Chain.Gnosis, this.GuidePage.Hardware, this.Response);
        router.get('/full-guide', Chain.Gnosis, this.GuidePage.Base, this.Response); // gudide - run execution and consensus layer clients
        router.get('/full-guide/solo', Chain.Gnosis, this.GuidePage.Solo, this.Response);
        router.get('/full-guide/stakewise', Chain.Gnosis, this.GuidePage.Stakewise, this.Response);
        //router.get('/fundamentals', Chain.Gnosis, this.fundamentals.Request, this.Response); // fundamentals
        
        router.get('/schema', Chain.Gnosis, this.StakingSchema.Request, this.Response);
        router.get('/clients', Chain.Gnosis, this.ClientsPage.ClientsOverview, this.Response);
        // charts
        //router.get('/charts', Chain.Gnosis, ChartsController.Request, ChartsController.Response);
        router.get('/gno-circulation-supply', ChartsController.GetData, ChartsController.GnoCirculationSupply, ChartsController.Response);
        router.get('/validators', Chain.Gnosis, ChartsController.GetData, ChartsController.Validators, ChartsController.Response);
        router.get('/news', Chain.Gnosis, this.NewsPage.Request, this.Response);
    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";

        const helpers = {
            stateLabel(key) {
                const map = {
                pending_initialized: 'Pending · Initialized',
                pending_queued: 'Pending · Queued',
                active_exiting: 'Active · Exiting',
                active_ongoing: 'Active · Ongoing',
                exited_unslashed: 'Exited · Unslashed',
                withdrawal_done: 'Withdrawal · Done',
                withdrawal_possible: 'Withdrawal · Possible',
                };
                return map[key] || key;
            },

            statePill(key) {
                const map = {
                pending_initialized:  'bg-amber-100 text-amber-800',
                pending_queued:       'bg-amber-100 text-amber-800',
                active_exiting:       'bg-red-100 text-red-800',
                active_ongoing:       'bg-green-100 text-green-800',
                exited_unslashed:     'bg-neutral-200 text-neutral-800',
                withdrawal_done:      'bg-sky-100 text-sky-800',
                withdrawal_possible:  'bg-sky-100 text-sky-800',
                };
                return map[key] || 'bg-neutral-200 text-neutral-800';
            },
            walletRows(obj) {
                if (!obj || typeof obj !== 'object') return [];
                return Object.entries(obj).map(([address, v]) => ({
                address,
                balance: Number(v?.balance ?? 0),
                validatorsCount: Array.isArray(v?.validators) ? v.validators.length : 0,
                unclaimed: Number(v?.unclaimed_balance ?? 0),
                }));
            },
        };

        helpers.topWallets = function (obj, n = 20) {
            const rows = helpers.walletRows(obj);
            return rows.sort((a, b) => b.balance - a.balance).slice(0, n);
        };

        helpers.balanceDistribution1d = function (obj) {
            const rows = helpers.walletRows(obj);
            const map = rows.reduce((acc, r) => {
                const bucket = (Math.round(r.balance * 10) / 10).toFixed(1);
                acc[bucket] = (acc[bucket] || 0) + 1;
                return acc;
            }, {});
            return Object.entries(map)
                .map(([bucket, count]) => ({ bucket: Number(bucket), count }))
                .sort((a, b) => a.bucket - b.bucket);
        };
        helpers.plus1 = (i) => (Number(i) ?? 0) + 1;

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
            helpers
        });
    }
}

new GnosisRouter();
module.exports = router;