//import express from 'express';
//import { engine } from 'express-handlebars';
"use strict";
const express = require('express'),
	  exphbs  = require('express-handlebars'),
	  handlebars = require('handlebars'),
	  app = express(),
	  path = require('path'),
	  fs = require('fs');
const numeral = require('numeral');
	
module.exports = {
	create: function(appName, port, staticFilesUrl){
		if(appName === undefined || port === undefined || staticFilesUrl === undefined) throw new Error("Missing attributes");
		const tport = normalizePort(process.env.PORT || port);
		const staticFilesPath = path.join(__dirname, '..',staticFilesUrl);

		app.listen(tport, () => console.log(new Date().toLocaleString(),"NODE SERVER | "+appName+" activated at port", tport, ". Static files url:", staticFilesPath));
		app.use(express.static(staticFilesPath));

		registerHelpers();

		const hbs = exphbs.create({
			extname: '.hbs',
			//defaultLayout: 'main',
			layoutsDir: __dirname + '/views/layouts/',
			partialsDir: __dirname + '/views/partials/'
		  });
		app.engine('handlebars', hbs.engine);
		app.set('view engine', 'handlebars');
		if(process.env.PRODUCTION == 1){
			app.set('views', './src/views');
		} else { // localhost
			app.set('views', './web/src/views');
		}
		return app;
	}
}

function registerHelpers(){
	handlebars.registerHelper('ifEqual', function (value, comparison, options) {
		return value === comparison ? options.fn(this) : options.inverse(this);
	});

	handlebars.registerHelper('timestamp', function() {
		return new Date().getTime();
	});

	handlebars.registerHelper('and', function (a, b, options) {
		return (a && b) ? options.fn(this) : options.inverse(this);
	});
	
	handlebars.registerHelper('or', function (a, b, options) {
		return (a || b) ? options.fn(this) : options.inverse(this);
	});

	handlebars.registerHelper('loadCSS', function(fileName, options) {
        const filePath = path.join(__dirname, '..', 'public/css', fileName + '.css');
        try {
            return new handlebars.SafeString(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return new handlebars.SafeString('');
        }
    });

	handlebars.registerHelper('formatNumber', function (number, format) {
		const isNumber = v => typeof v === 'number' && Number.isFinite(v);
		if(!isNumber(number)) {
			console.warn("formatNumber", number);
			return "??";
		};
		return numeral(number).format(format);
	});

	handlebars.registerHelper('formatDate', function (value, format) {
		const d = new Date(value);
		if (isNaN(d)) return value;

		switch (format) {
			case 'date':
			return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d);
			case 'time':
			return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(d);
			default:
			return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
		}
	});
}

function normalizePort(val) {
	var port = parseInt(val, 10);
	if (isNaN(port)) {
	  // named pipe
	  return val;
	}
	if (port >= 0) {
	  // port number
	  return port;
	}
	return false;
  }