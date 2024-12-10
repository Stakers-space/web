"use strict";
var app = null;

function GuidesPagePresenter(){ 
    app = this;
}

GuidesPagePresenter.prototype.Response = function(req,res){
    res.render("guides/home", {
		layout: "ampLayout",
		pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
		alternateUrl: null,//alternateUrl,
		alternateLang: null,//req.appData.meta.alt.lang,
		title: "Stakers.space",//req.appData.meta.title,
		metaDescription: null,//req.appData.meta.meta_desc,
		lang: "en",//req.appData.meta.lang,
		js:null,//req.appData.meta.js,
		css:0,//req.appData.meta.css,
		logo: null,//req.appData.meta.logo,
		pdata: null,//req.appData.pdata, // page data
		isEnglish: true,
		isError: false,
		logOutBtn: true,
		helpers: {}
	});
};

module.exports = GuidesPagePresenter;