"use strict";

const router = require('express').Router();
const fs = require('fs'),
	  path = require('path');

class GuidesRouter {
    constructor(){
        router.get('/', this.Response);
    }

    Response(req, res){
        fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.executionClients = Object.values(clients.executionLayer);
                    res.locals.consensusClients = Object.values(clients.consensusLayer);
					res.locals.mevClients = Object.values(clients.mevLayer);
					res.locals.serviceClients = Object.values(clients.serviceLayer);
                } catch (err) {
                    console.error(err);
                }
            }
            
			res.render("pages/guides", {
                layout: "amp",
                pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
                alternateUrl: null,//alternateUrl,
                alternateLang: null,//req.appData.meta.alt.lang,
                title: "Stakers.space guides",//req.appData.meta.title,
                metaDescription: "Guides overview for Staking on selected chains",//req.appData.meta.meta_desc,
                lang: "en",//req.appData.meta.lang,
                js:null,//req.appData.meta.js,
                cssFile:"pages",//req.appData.meta.css,
                helpers: {}
            })
        });
    }
}

new GuidesRouter();
module.exports = router;


/**
	 * /guides
	 * 		- odkazuje na ruzne dílčí seskladáné stránky
     * 
     *      /offilne-pc
	 * 		/ubuntu-server-setup
	 * 		/node-setup
	 * 			/ethereum - complete guide
	 * 			/gnosis - complete guide
	 * 		/install
	 * 			/nethermind
	 * 			/erigon
	 * 			/lighthouse
	 * 			/lodestar
	 * 			/prysm
	 * 			/teku
	 * 		/update
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
GuidesRouter.prototype.httpListener = function(c){
    this.HomePage = new c.homePage();
   
    // homepage
    router.get('/', this.HomePage.Response);
    /*router.get('/offilne-pc', this.HomePage.Response);
    router.get('/ubuntu-server-setup', this.HomePage.Response);
    // Node setup pages
    router.get('/node-setup', this.HomePage.Response);
    router.get('/node-setup/ethereum', this.HomePage.Response);
    router.get('/node-setup/gnosis', this.HomePage.Response);
    // Client install pages
    router.get('/install', this.HomePage.Response);
    router.get('/install/nethermind', this.HomePage.Response);
    router.get('/install/erigon', this.HomePage.Response);
    router.get('/install/lighthouse', this.HomePage.Response);
    router.get('/install/lodestar', this.HomePage.Response);
    router.get('/install/prysm', this.HomePage.Response);
    router.get('/install/teku', this.HomePage.Response);
    // Client update pages
    router.get('/update', this.HomePage.Response);
    router.get('/update/nethermind', this.HomePage.Response);
    router.get('/update/erigon', this.HomePage.Response);
    router.get('/update/lighthouse', this.HomePage.Response);
    router.get('/update/lodestar', this.HomePage.Response);
    router.get('/update/prysm', this.HomePage.Response);
    router.get('/update/teku', this.HomePage.Response);
    // Validator exit
    router.get('/validator-exit', this.HomePage.Response);
    router.get('/validator-exit/lighthouse', this.HomePage.Response);
    router.get('/validator-exit/lodestar', this.HomePage.Response);
    router.get('/validator-exit/prysm', this.HomePage.Response);
    router.get('/validator-exit/teku', this.HomePage.Response);*/
};

new GuidesRouter();

module.exports = router;