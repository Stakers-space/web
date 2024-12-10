"use strict";
const router = require('express').Router();

function IndexRouter(){    
    // http listeners
    var controllers = {
        homePage: require('../controllers/ubuntu')
    };
    this.httpListener(controllers);
}

IndexRouter.prototype.httpListener = function(c){
    this.HomePage = new c.homePage();
   
    // homepage
    router.get('/', this.HomePage.Request, this.HomePage.Response);
    router.get('/install', this.HomePage.Request, this.HomePage.Response);
};

new IndexRouter();

module.exports = router;