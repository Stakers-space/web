"use strict";
const router = require('express').Router();

router.get('/', function(req,res){
    res.render("contact", {
        layout: "amp",
        pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
        title: "Contact Us | Stakers.space", //req.appData.meta.title,
        metaDescription: "Feel free to contact us regarding staking related services.",
        cssFile: "hp"
    });
});

module.exports = router;