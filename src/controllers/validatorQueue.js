"use strict";
var app = null;
const fs = require('fs'),
      path = require('path');
const numeral = require('numeral');
const ValidatorQueueModel = require('../models/validatorqueue');

const cache_validatorQueue = require('../middlewares/cache/validatorqueue');

class ValidatorQueue { 
	constructor(){
        this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
		app = this;
	}

    ChainLabel(req,res, next){
        app.Calculate(res.locals.chain, function(err,data){
            if(err) res.status(500).send(err);
            
            res.locals.currentQueue = data.current;
            res.locals.churnSchedule = data.schedule;
            res.locals.rangeIndex = data.rangeIndex;
            next();
        });
    };

    Page(req,res,next){
        app.Calculate(res.locals.chain, function(err,data){
            if(err) res.status(500).send(err);
            res.locals.page_hbs = "validator-queue";
            res.locals.layout_hbs = "standard";
            res.locals.css_file = "chain";
            res.locals.currentQueue = data.current;
            res.locals.churnSchedule = data.schedule;
            res.locals.rangeIndex = data.rangeIndex;
            res.locals.title = `${res.locals.chainName} staking Validator Queue`;
            res.locals.metaDescription = `Current as well as historical waiting time for activation / exiting a validator on ${res.locals.chainName} chain`;
            //console.log(data);
            next();
        });
    };

    Response(req,res){
        res.render("hp", {
            layout: "amp",
            pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
            alternateUrl: null,//alternateUrl,
            alternateLang: null,//req.appData.meta.alt.lang,
            title: "Stakers.space",//req.appData.meta.title,
            metaDescription: null,//req.appData.meta.meta_desc,
            lang: "en",//req.appData.meta.lang,
            js:null,//req.appData.meta.js,
            css:0,//req.appData.meta.css,
            helpers: {}
        });
    }

    Calculate(chain, cb){
        // get churn schedule
        fs.readFile(path.join(__dirname, '..', '..', app.dataFile.ethereum.validatorQueue), 'utf8', (err, data) => {
            if(err){
                console.error(err);
                return cb(err, null);
            } else {
                //console.log(queueScheduleList);
                let model = new ValidatorQueueModel();
                return cb(null, model.GetSnapshot(cache_validatorQueue.getValidatorQueue(chain), chain, JSON.parse(data)));
            }
        });
    }
}

module.exports = ValidatorQueue;