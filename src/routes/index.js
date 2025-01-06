const express = require('express');
const router = express.Router();

/**
 * required for all authentizated user related pages, including authentization pages
 */
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
const passportConf = require('../config/config.secret.json').passport;
router.use(['/authentization','/dashboard','/api/account'],
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
router.use('/ethereum-staking', require('./ethereum'));
router.use('/gnosis-staking', require('./gnosis'));
router.use('/api', require('./api'));
router.use('/test', require('./test'));
router.use('/authentization', require('./authentization'));
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
router.use('/rocketpool', require('./service'));
router.use('/stakewise', require('./service'));
router.use('/lido', (req, res) => {
    res.redirect('/ethereum-staking/full-guide/lido');
});

// Mev clients
router.use('/mev-boost', require('./client'));
router.use('/guides', require('./guides'));

router.use('/about', function(req,res,next){
    res.locals.page_hbs = 'about';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/chains', function(req,res,next){
    res.locals.page_hbs = 'chains';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);


router.use('/cloud-node', function(req,res,next){
    res.locals.page_hbs = 'cloud-node';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/custom-node', function(req,res,next){
    res.locals.page_hbs = 'custom-node';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/managed-node', function(req,res,next){
    res.locals.page_hbs = 'managed-node';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/staking-node', function(req,res,next){
    res.locals.page_hbs = 'staking-node';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/vpn', function(req,res,next){
    res.locals.page_hbs = 'vpn';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/bonded-validators', function(req,res,next){
    res.locals.page_hbs = 'bonded-validators';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/staking', function(req,res,next){
    res.locals.page_hbs = 'staking';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/liquid-staking', function(req,res,next){
    res.locals.page_hbs = 'liquid-staking';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/restaking', function(req,res,next){
    res.locals.page_hbs = 'restaking';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/slashing', function(req,res, next){
    res.locals.page_hbs = 'slashing';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/tools', function(req,res,next){
    res.locals.page_hbs = 'tools';
    res.locals.layout_hbs = 'amp';
    next();
}, Response);

router.use('/sitemap', require('./sitemap'));

function Response(req,res){
    console.log(req.originalUrl.split('?')[0]);
    const cononicalUrl = (process.env.PORT) ? "https://stakers.space"+req.originalUrl.split('?')[0] : null; // allow localhost
    res.render(res.locals.page_hbs, {
        layout: res.locals.layout_hbs,
        canonicalUrl: cononicalUrl,
        title: "Stakers.space",
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