"use strict";
const router = require('express').Router();

function IndexRouter(){    
    // http listeners
    var controllers = {
        homePage: require('../controllers/homePage.js'),
        newsPage: require('../controllers/newsPage.js')
    };
    this.httpListener(controllers);
}

IndexRouter.prototype.httpListener = function(c){
    this.HomePage = new c.homePage();
    this.NewsPage = new c.newsPage();
   
    // homepage
    router.get('/', this.HomePage.Request, this.HomePage.Response);
    router.get('/news', this.NewsPage.Request, this.NewsPage.Response);
};

new IndexRouter();

module.exports = router;