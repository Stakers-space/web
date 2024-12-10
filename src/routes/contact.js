"use strict";
const router = require('express').Router();

router.get('/', function(req,res){
    res.render("contact", {
        layout: "amp",
        pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
        title: "Stakers.space", //req.appData.meta.title,
        cssFile: "hp"
    });
});

module.exports = router;