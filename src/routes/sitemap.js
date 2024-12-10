"use strict";

const router = require('express').Router();
const pagesToIndexList = require('../../data/pages.json');

class SitemapRouter {
    constructor(){
        router.get('/', this.Response);
    }

    Response(req, res){
        res.header('Content-Type', 'application/xml');
        res.render("sitemap", {
            layout: false,
            sitemapData: pagesToIndexList
        });
    }
}

new SitemapRouter();
module.exports = router;