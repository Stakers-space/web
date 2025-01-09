"use strict";
const router = require('express').Router();

router.get('/', function(req,res){
    res.render("account", {
        layout: "standard",
        pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
        title: "Stakers.space Account | Your staking Hub & Online Monitoring", //req.appData.meta.title,
        metaDescription: "Manage all your servers and validators owned by you or your clients safely from one place. Client-side encrypted cloud dashboard.",
        cssFile: "account"
    });
});

module.exports = router;