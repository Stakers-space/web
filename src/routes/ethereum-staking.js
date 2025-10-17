"use strict";
const router = require('express').Router();
const EthereumController = require('../controllers/ethereum');
const GuidePageController = require('../controllers/guidePage')
//const FundamentalsController = require('../controllers/fundamentalsPage');
const StakingSchema = require('../controllers/stakingSchema');
const Chain = require('../middlewares/SetChain');
const NewsPageSchema = require('../controllers/newsPage');
const ClientsController = require('../controllers/clientPage');
const ValidatorQueueController = require('../controllers/validatorQueue');
const ChartsController = require('../controllers/charts');

class EthereumRouter {
    constructor(){
        this.GuidePage = new GuidePageController();
        //this.fundamentals = new FundamentalsController();
        this.StakingSchema = new StakingSchema();
        this.NewsPage = new NewsPageSchema();
        this.ClientsPage = new ClientsController();
        this.ValidatorQueue = new ValidatorQueueController();
        this.httpListener();
    }

    httpListener(){
        router.get('/', Chain.Ethereum, EthereumController.STAKING, this.Response); // homepage staking
        //router.get('/overview', Chain.Ethereum, EthereumController.OVERVIEW, this.Response); // staking network overview

        router.get('/liquid-staking', Chain.Ethereum, EthereumController.RequestLiquid, this.Response);
        router.get('/validators-saas', Chain.Ethereum, EthereumController.RequestSaas, this.Response);
        router.get('/smoothing-pools', Chain.Ethereum, EthereumController.SmoothingPools, this.Response);
        router.get('/mev-relay-list', Chain.Ethereum, EthereumController.RelayList, this.Response);
        
        // topic-based
        router.get('/validators', Chain.Ethereum, ChartsController.validators_overview, this.Response);
        router.get('/keystores', Chain.Ethereum, EthereumController.Keystores, this.Response);
        router.get('/maintenance', Chain.Ethereum, this.GuidePage.Maintenance, this.Response);
        router.get('/emergency', Chain.Ethereum, this.GuidePage.Emergency, this.Response);
        router.get('/validator-queue', Chain.Ethereum, this.ValidatorQueue.Page, this.Response);

        router.get('/validator-actions', Chain.Ethereum, this.GuidePage.ValidatorActions, this.Response);
        router.get('/staking-hardware', Chain.Ethereum, this.GuidePage.Hardware, this.Response);
        router.get('/full-guide', Chain.Ethereum, this.GuidePage.Base, this.Response); // gudide - run execution and consensus layer clients
        router.get('/full-guide/solo', Chain.Ethereum, this.GuidePage.Solo, this.Response);
        router.get('/full-guide/rocketpool', Chain.Ethereum, this.GuidePage.Rocketpool, this.Response);
        router.get('/full-guide/stakewise', Chain.Ethereum, this.GuidePage.Stakewise, this.Response);
        router.get('/full-guide/lido', Chain.Ethereum, this.GuidePage.Lido, this.Response);
        //router.get('/fundamentals', Chain.Ethereum, this.fundamentals.Request, this.Response); // fundamentals
        router.get('/schema', Chain.Ethereum, this.StakingSchema.Request, this.Response);
        router.get('/clients', Chain.Ethereum, this.ClientsPage.ClientsOverview, this.Response);
        router.get('/news', Chain.Ethereum, this.NewsPage.Request, this.Response);
    }

    Response(req,res){
        if(res.locals.title && res.locals.title.lenght <= 44) res.locals.title += " | Stakers.space";
        //console.log(res.locals.page_hbs, "("+res.locals.layout_hbs+")")
        
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
        helpers.short = function (value, opts) {
            const s = value == null ? '' : String(value);
            const start = Number(opts?.hash?.start ?? 6);
            const end   = Number(opts?.hash?.end   ?? 4);
            const sep   = String(opts?.hash?.sep   ?? '……');

            if (s.length <= start + end + sep.length) return s;
            return s.slice(0, start) + sep + s.slice(-end);
        };
        
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
            helpers
        });
    }
}

new EthereumRouter();
module.exports = router;