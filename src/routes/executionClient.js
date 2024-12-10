/**
 * Route for clients pages
 * /Nethermind
 * /Nethermind/installation
 * /Nethermind/update
 * /Nethermind/configuration
 * ...
 */
"use strict";
const router = require('express').Router();

function ExecutionClientRouter(){    
    // http listeners
    var controllers = {
        home: require('../controllers/clientPage')
    };
    this.httpListener(controllers);
}

ExecutionClientRouter.prototype.httpListener = function(c){
    this.home = new c.home();

    router.get('/', this.home.Request, this.home.Response);
    router.get('/install', this.home.Request, this.home.Response);
    router.get('/update', this.home.Request, this.home.Response);
};

new ExecutionClientRouter();

module.exports = router;