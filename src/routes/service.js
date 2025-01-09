const router = require('express').Router();
const fs = require('fs'),
	  path = require('path');

class ClientRouter {
    constructor(){
        router.get('/', this.Response);
    }

    Response(req, res){
		// recognize - rocketpool vs stakewise
		const segments = req.originalUrl.split('/').filter(Boolean);
		let service = null;
		res.locals.hbsTemplate = "service";
		if (segments.length === 1) service = segments[0];

		if(!service){
			return res.status(404).send('Requested page does not exists.');
		}

		fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
					res.locals.serviceData = clients.serviceLayer[service];
					res.locals.title = res.locals.serviceData.name;
                } catch (err) {
                    console.error(err);
                }
            }
			
			res.render(res.locals.hbsTemplate, {
				layout: "standard",
				pageUrl: 'https://stakers.space',//('https://' + req.appData.host + req.canonicalUrl),
				alternateUrl: null,//alternateUrl,
				alternateLang: null,//req.appData.meta.alt.lang,
				lang: "en",//req.appData.meta.lang,
				js:null,//req.appData.meta.js,
				cssFile:"docs",//req.appData.meta.css,
				client: res.locals.client,
				helpers: {}
			})
        });    
    }
}

new ClientRouter();
module.exports = router;