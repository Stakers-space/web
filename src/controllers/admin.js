const fs = require('fs'),
    path = require('path');
const clientsFile = path.join(__dirname, '..', '..', 'data/clients.json');
const NewsController = require('./news');
const NewsModel = require('../models/newsObj.js');
const MySqlDBplatform = require('../services/mysqlDB.js');


exports.NewsPage = function(req,res,next){
    // Render adminPage
    if(req.user.role !== "admin") { res.locals.err = "Unauthorized access"; return next(); }

    res.locals.hbs = "manageNews";
    new NewsController().GetMarksFromDb(300, function(err,data){
        if(err){ res.locals.err = err; return next(); }
        res.locals.submitLink = "/dashboard/manage-news";
        res.locals.newsList = data;
        res.locals.formTitle = "Manage News";
        //console.log(data);
        res.locals.timestamp = new Date();
        console.log(res.locals.timestamp);
        next();
    });
};

exports.ManageNewsMessage = function(req,res){
    //console.log(req.user, req.body);
    if(req.user.role !== "admin") return ThrowError("Unauthorized request", res);
    
    // Post news to DB
    let news = new NewsModel();
    news.SetMessage(req.body.message);
    news.SetLink(req.body.link);
    if(req.body.ethereum) news.SetCategory(req.body.ethereum);
    if(req.body.gnosis) news.SetCategory(req.body.gnosis);
    if(req.body.fundamental) news.SetCategory(req.body.fundamental);
    if(req.body.client) news.SetCategory(req.body.client);
    if(req.body.timestamp) news.SetTimestamp(Number(req.body.timestamp));
    console.log("Submitting news to DB", news);
    if(req.body.message_id !== ""){
        // Update mark
        news.id = req.body.message_id;
        new NewsController().UpdateMark(news, function(err,resp){
            if(err) return ThrowError(err, res);
    
            res.redirect('/dashboard/admin/news?success=true');
        });
    } else {
        new NewsController().AddMark(news, function(err,resp){
            if(err) return ThrowError(err, res);
    
            res.redirect('/dashboard/admin/news?success=true');
        });
    }  
};

exports.ClientsPage = function(req,res,next){
    if(req.user.role !== "admin") { res.locals.err = "Unauthorized access"; return next(); }
    
    res.locals.hbs = "manageClients";
    res.locals.submitLink = "/dashboard/update-clients";
    res.locals.formTitle = "Update clients";
    res.locals.clientsData = {};
    // load .js file
    // print it into the page
    fs.readFile(clientsFile, 'utf8', (err, data) => {
		if(!err) {
			try { res.locals.clientsData = data; } catch (e) { err = e; }
		}
        if(err) { res.locals.err = err; next(); }
        next();
	});
};

exports.UpdateClientsFile = function(req,res){
    if(req.user.role !== "admin") return ThrowError("Unauthorized request", res);
    fs.writeFile(clientsFile, req.body.json, 'utf8', (err) => {
        if (err) ThrowError(err,res);
        // Start async task - Set recomendations in `servers_clients`
        new MySqlDBplatform().UpdateClientsRecommendations(JSON.parse(req.body.json), null);
        res.redirect('/dashboard/admin/clients?success=true');
    });
};

exports.ApiPage = function(req,res,next){
    // get user data from db
    res.locals.hbs = "api";
    new MySqlDBplatform().GetApiCredentials(req.user.id, function(err,resp){
        if(!err){
            res.locals.account_id = req.user.id;
            res.locals.account_api_token = resp[0].api_token;
        } else {
            console.log(err);
        }
        next();
    });
    
    
};

function ThrowError(err,res){
    console.log("err:", err);
    res.send(err);
}