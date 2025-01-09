"use strict";
const router = require('express').Router();

router.get('/', function(req,res){
    res.render("pricing", {
        layout: "amp",
        pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
        title: "Stakers.space pricing", //req.appData.meta.title,
        metaDescription: null,
        cssFile: "hp"
    });
});

module.exports = router;