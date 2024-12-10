"use strict";
var app = null;
const fs = require('fs');

function UbuntuPresenter(){ 
    app = this;
}

UbuntuPresenter.prototype.Request = function(req,res, next){
    
	// load newsfeed
	next();

};

UbuntuPresenter.prototype.Response = function(req,res){
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
};

module.exports = UbuntuPresenter;