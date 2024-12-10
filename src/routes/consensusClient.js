/**
 * Route pro stránky klientů
 * /Nethermind
 * /Nethermind/installation
 * /Nethermind/update
 * /Nethermind/configuration
 * ...
 */
"use strict";
const router = require('express').Router();

function ConsensusClientRouter(){    
    // http listeners
    var controllers = {
        home: require('../controllers/clientPage')
    };
    this.httpListener(controllers);
}

ConsensusClientRouter.prototype.httpListener = function(c){
    this.home = new c.home();

    router.get('/', this.home.Request, this.home.Response);
    router.get('/install', this.home.Request, this.home.Response);
    router.get('/update', this.home.Request, this.home.Response);
    router.get('/validator', this.home.Request, this.home.Response);
};

new ConsensusClientRouter();

module.exports = router;