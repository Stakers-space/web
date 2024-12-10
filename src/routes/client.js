const router = require('express').Router();
const ClientController = require('../controllers/clientPage');

class ClientRouter {
    constructor(){
        const client = new ClientController();
        router.get('/', client.Request, this.Response);

		router.get('/install', client.Request, this.Response);
		router.get('/update', client.Request, this.Response);
		router.get('/emergency', client.Request, this.Response);

		router.get('/add-validator', client.Request, this.Response);
		router.get('/exit-validator', client.Request, this.Response);
    }

    Response(req, res){
        res.render(res.locals.hbsTemplate, {
			layout: "standard",
			pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
			alternateUrl: null,//alternateUrl,
			alternateLang: null,//req.appData.meta.alt.lang,
			title: "Stakers.space",//req.appData.meta.title,
			metaDescription: null,//req.appData.meta.meta_desc,
			lang: "en",//req.appData.meta.lang,
			js:null,//req.appData.meta.js,
			cssFile:"docs",//req.appData.meta.css,
			client: res.locals.client,
			helpers: {}
		})
    }
}

new ClientRouter();
module.exports = router;