// controllers/wwwRemovalController.js
'use strict';

exports.wwwRemoval = function(req, res, next) {
    const host = req.header("host");
    //console.log("stakers.space app | req. from host:", host, req.url);
    if (!host.match(/^www\..*/i)) {
        //res.setHeader("Access-Control-Allow-Origin", "*");
	    //res.setHeader("Access-Control-Allow-Credentials", "true");
	    //res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	    //res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
        
        if(process.env.PORT !== undefined && host !== "stakersspace.azurewebsites.net"){ // production
            res.locals.canonicalUrl = `https://stakers.space`;
            if(req.url !== "/") res.locals.canonicalUrl+= req.url;
        }
        
        next();
    } else {
        // Uncomment the following line to enable redirect
        res.redirect(301, "https://stakers.space" + req.originalUrl);
    }
};