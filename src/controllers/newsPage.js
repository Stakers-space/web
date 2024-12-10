"use strict";
var app = null;
const fs = require('fs'),
	  path = require('path');

function NewsPagePresenter(){ 
	app = this;
	app.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
}

NewsPagePresenter.prototype.Request = function(req, res, next){
	//console.log("FundamentalsPagePresenter.Request");
	//console.log(res.locals.chain, app.dataFile);
	switch(res.locals.chain){
		case "gnosis": 
			app.newsDataFile = path.join(__dirname, '..', '..',  app.dataFile.pagecache.news.gnosis);
			break;
		case "ethereum": 
			app.newsDataFile = path.join(__dirname, '..', '..',  app.dataFile.pagecache.news.ethereum);
			break;
		default: 
			app.newsDataFile = path.join(__dirname, '..', '..',  app.dataFile.pagecache.news.hp);
	}

	fs.readFile(app.newsDataFile, 'utf8', (err, data) => {
		if(!err) {
            try {
                const jsonData = JSON.parse(data);
                res.locals.newsfeed = jsonData;
            } catch (err) {
                console.error(err);
            }
		}
		next();
	});
};

NewsPagePresenter.prototype.Response = function(req,res){
	//console.log("NewsPagePresenter.Response", res.locals);
    res.render("newsPage", {
		layout: "standard",
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		title: "Stakers.space",//req.appData.meta.title,
		metaDescription: null,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		cssFile:"hp",//req.appData.meta.css,
		helpers: {}
	});
};

module.exports = NewsPagePresenter;