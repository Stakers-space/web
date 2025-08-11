"use strict";

const router = require('express').Router();
const pagesToIndexList = require('../../data/pages.json');

class SitemapRouter {
    constructor(){
        router.get('/', this.Response);
        router.get('/links', this.RespLinks)
    }

    Response(req, res){
        res.header('Content-Type', 'application/xml');
        res.render("sitemap", {
            layout: false,
            sitemapData: pagesToIndexList
        });
    }

    RespLinks(req,res){
        const cononicalUrl = (process.env.PORT) ? "https://stakers.space"+req.originalUrl.split('?')[0] : null; // allow localhost
        /*for(var i=0; i<pagesToIndexList.length;i++){
            pagesToIndexList[i].url = pagesToIndexList[i].url.substring(21);
        }*/
        
        res.render("pages/sitemapLinks", {
            layout: "amp",
            canonicalUrl: cononicalUrl,
            cssFile: "pages",
            sitemapData: pagesToIndexList
        });
    }
}

new SitemapRouter();
module.exports = router;