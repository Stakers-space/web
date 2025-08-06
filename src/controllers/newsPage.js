"use strict";
var app = null;
const fs = require('fs'),
	  path = require('path');

function NewsPagePresenter(){ 
	app = this;
	app.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
}

NewsPagePresenter.prototype.Request = function(req, res, next){
	res.locals.title = `${res.locals.chainName} staking news`;
    res.locals.metaDescription = `News from ${res.locals.chainName} staking world`;
	res.locals.page_hbs = "news/newsPage";
	res.locals.layout_hbs = "standard";
	res.locals.css_file = "news";


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
    res.render(res.locals.page_hbs, {
		layout: "standard",
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		title: `Staking news | Stakers.space`,//req.appData.meta.title,
		metaDescription: `News from staking world`,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		cssFile: res.locals.css_file,//req.appData.meta.css,
		helpers: {}
	});
};

module.exports = NewsPagePresenter;