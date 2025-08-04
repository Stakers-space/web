const express = require('express');
const router = express.Router();

/**
 * required for all authentizated user related pages, including authentization pages
 */
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
const passportConf = require('../config/config.secret.json').passport;
router.use([/*'/authentization',*/'/dashboard','/api/account'],
	session({
		secret: passportConf.sessionSecret,
		resave: false,
		saveUninitialized: false,
		cookie: { secure: /*(process.env.PORT != undefined)*/false, maxAge: (365 * 24 * 60 * 60000) } // secure: false for http (localhost)
	}),
	passport.initialize(),
	passport.session(),
	cookieParser()
);

router.use('/', require('./homepage'));
/*router.use('/ethereum', function(req,res,next){
    res.locals.page_hbs = 'ethereum/index';
    res.locals.layout_hbs = 'standard';
    res.locals.title = `Ethereum | Stakers.space`;
    res.locals.metaDescription = null;
    console.log(req.originalUrl.split('?')[0]);
    const cononicalUrl = (process.env.PORT) ? "https://stakers.space"+req.originalUrl.split('?')[0] : null; // allow localhost
    res.render(res.locals.page_hbs, {
        layout: res.locals.layout_hbs,
        canonicalUrl: cononicalUrl,
        cssFile: "chainpage"
    });
});*/
router.use('/ethereum', require('./ethereum-tailwind'));
router.use('/ethereum-staking', require('./ethereum'));
router.use('/gnosis-staking', require('./gnosis'));
router.use('/api', require('./api'));
router.use('/test', require('./test'));
//router.use('/authentization', require('./authentization')); // moved to dashboard
router.use('/dashboard', require('./dashboard'));
router.use('/charts', require('./charts'));
router.use('/account', require('./account'));
router.use('/contact', require('./contact'));
router.use('/pricing', require('./pricing'));
router.use('/clients', require('./client'));
// Execution clients
router.use('/nethermind', require('./client'));
router.use('/erigon', require('./client'));
router.use('/geth', require('./client'));
router.use('/reth', require('./client'));
router.use('/besu', require('./client'));
router.use('/ethereumjs', require('./client'));
// Consensus clients
router.use('/lighthouse', require('./client'));
router.use('/lodestar', require('./client'));
router.use('/teku', require('./client'));
router.use('/nimbus', require('./client'));
router.use('/prysm', require('./client'));
router.use('/stakewise', require('./service'));
router.use('/rocketpool', (req, res) => {
    res.redirect('/ethereum-staking/full-guide/rocketpool');
}/*require('./service')*/);
router.use('/lido', (req, res) => {
    res.redirect('/ethereum-staking/full-guide/lido');
});

// Mev clients
router.use('/mev-boost', require('./client'));
router.use('/guides', require('./guides'));

router.use('/about', function(req,res,next){
    res.locals.page_hbs = 'pages/about';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `About Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/privacy-policy', function(req,res,next){
    res.locals.page_hbs = 'pages/privacy-policy';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Privacy Policy | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/terms-and-conditions', function(req,res,next){
    res.locals.page_hbs = 'pages/terms-conditions';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Terms & Conditions | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/disclaimer', function(req,res,next){
    res.locals.page_hbs = 'pages/disclaimer';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Disclaimer | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/chains', function(req,res,next){
    res.locals.page_hbs = 'chains';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Chains | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);


router.use('/cloud-node', function(req,res,next){
    res.locals.page_hbs = 'cloud-node';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Cloud staking node | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/custom-node', function(req,res,next){
    res.locals.page_hbs = 'custom-node';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Custom staking node | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/managed-node', function(req,res,next){
    res.locals.page_hbs = 'managed-node';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Managed staking node | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/staking-node', function(req,res,next){
    res.locals.page_hbs = 'staking-node';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Staking node | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/vpn', function(req,res,next){
    res.locals.page_hbs = 'vpn';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `VPN for Staking | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/bonded-validators', function(req,res,next){
    res.locals.page_hbs = 'bonded-validators';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Bonded validators | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/staking', function(req,res,next){
    res.locals.page_hbs = 'wiki/staking';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `About Staking | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/liquid-staking', function(req,res,next){
    res.locals.page_hbs = 'wiki/liquid-staking';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Liquid Staking | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/restaking', function(req,res,next){
    res.locals.page_hbs = 'wiki/restaking';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `ReStaking | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/slashing', function(req,res, next){
    res.locals.page_hbs = 'wiki/slashing';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Slashing | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/tools', function(req,res,next){
    res.locals.page_hbs = 'tools';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Tools | Stakers.space`;
    res.locals.metaDescription = null;
    next();
}, Response);

router.use('/knowledge-sources', function(req,res,next){
    res.locals.page_hbs = 'knowledge-sources';
    res.locals.layout_hbs = 'amp';
    res.locals.title = `Other Knowledge Sources | Stakers.space`;
    res.locals.metaDescription = null;
    res.locals.noIndex = true;
    next();
}, Response);

router.use('/sitemap', require('./sitemap'));

function Response(req,res){
    console.log(req.originalUrl.split('?')[0]);
    const cononicalUrl = (process.env.PORT) ? "https://stakers.space"+req.originalUrl.split('?')[0] : null; // allow localhost
    res.render(res.locals.page_hbs, {
        layout: res.locals.layout_hbs,
        canonicalUrl: cononicalUrl,
        cssFile: "chain"
    });
}

/*
	// Ubuntu
	this.app.use('/ubuntu-server', require('./routes/ubuntu.js'));
*/
	// indivudual pages
	/**
	 * /guides
	 * 		/offilne-pc
	 * 		/ubuntu-server
	 * 			/install
	 * 		/node-setup
	 * 			/ethereum - complete guide
	 * 			/gnosis - complete guide
	 * 		/clients
	 * 		/erigon
	 * 		/lighthouse
	 * 		/lodestar
	 * 		/prysm
	 * 		/teku
	 * 			/install
	 * 			/update
	 * 			
	 * 		/client-update
	 * 			/nethermind
	 * 			/erigon
	 * 			/lighthouse
	 * 			/lodestar
	 * 			/prysm
	 * 			/teku
	 * 		/validator-exit
	 * 			/lighthouse
	 * 			/lodestar
	 * 			/prysm
	 * 			/teku
	 * 			/presigned-keys
	 */

module.exports = router;