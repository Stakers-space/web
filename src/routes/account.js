"use strict";
const router = require('express').Router();

router.get('/', function(req,res){
    res.render("account", {
        layout: "standard",
        pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
        title: "Stakers.space", //req.appData.meta.title,
        cssFile: "account"
    });
});

module.exports = router;