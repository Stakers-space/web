"use strict";
const https = require('https');
//const http = require('http');

function Xmlhttp(){}

Xmlhttp.prototype.HttpsRequest = function(options, body, cb){
	const req = https.request(options, (resp) => {
		if(resp.statusCode === 404) return cb("Err 404: not found");
		let responseData = '';
		resp.on('data', (chunk) => { responseData += chunk; });
		resp.on('end', () => { return cb(null,responseData); }); 
	}).on('error', error => { return cb(error,null); });
	if(body) req.write(body);
	req.end();
};


module.exports = Xmlhttp;