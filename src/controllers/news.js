/**
 * Controller for all news view
 * Controller for Adding / removing news
 * Controller for caching news into cached file 
 * */

"use strict";
var app = null;
const fs = require('fs'),
      path = require('path'),
      azureCosmosDB = require('../services/azureCosmosDB');
const NewsModel = require('../models/newsObj.js');
const { format, formatDistanceToNow } = require('date-fns');

function NewsController(){
    this.dataFile = require(path.join(__dirname, '..', 'config/data_files.json'));
    app = this;
}
/**
 * get marks (intended for page-based controllers)
 * @param {*} page 
 */
NewsController.prototype.GetMarks = function(page){
    fs.readFile(path.join(__dirname, '..', '..',  app.dataFile.pagecache.news[page]), 'utf8', (err, fileContent) => {
       return(err, fileContent);
    });
};

NewsController.prototype.GetMarksFromDb = function(limit, cb){
    let query = 'SELECT * FROM c WHERE c.partitionKey = @partitionKey ORDER BY c.t DESC';
    if(limit) query+=' OFFSET 0 LIMIT '+limit;
    azureCosmosDB.queryContainer("data", query, "news", function(err,data){
        return cb(err,data);
    });
};

NewsController.prototype.AddMark = function(newsModelData, cb){
    console.log("[NewsController] AddMark", newsModelData);
    azureCosmosDB.createFamilyItem("data", newsModelData, (err,resp) => {
        if(!err){
            // recache news
            app.RegenerateCacheFiles();
        }
       return cb(err, resp);
    });
};
NewsController.prototype.UpdateMark = function(newsModelData, cb){
    console.log("[NewsController] UpdateMark", newsModelData);
    azureCosmosDB.replaceFamilyItem("data", newsModelData, (err,resp) => {
        if(!err){
            // recache news
            app.RegenerateCacheFiles();
        }
       return cb(err, resp);
    });
};

NewsController.prototype.RemoveMark = function(id, cb){
    let newsItem = new NewsModel();
    newsItem.id = id;

    azureCosmosDB.deleteFamilyItem("data", newsItem, (err,resp) => {
        if(!err){
            // recache news
            app.RegenerateCacheFiles();
        }
        return cb(err, resp)
    });
};

NewsController.prototype.RegenerateCacheFiles = function(){
    app.GetMarksFromDb(200, function(err,data){
        if(err){
            console.error(err);
            return;
        } 
        let hpNews = {"all":[],"fundamental":[],"clients":[]},
            gnosisNews = {"all":[],"fundamental":[],"clients":[]},
            ethereumNews = {"all":[],"fundamental":[],"clients":[]};
        
        for(const obj of data){
            const isEthereumChain = (obj.c.indexOf("eth") > -1);
            const isGnosisChain = (obj.c.indexOf("gno") > -1);
            const isFundamentalNew = (obj.c.indexOf("fundamental") > -1);
            const isClientNew = (obj.c.indexOf("client") > -1);
            obj.ht = formatTimestamp(obj.t);
            obj.ta = timeAgo(obj.t);
            if(isEthereumChain) {
                ethereumNews.all.push(obj);
                obj.img = "ethereum";
            }
            if(isGnosisChain) {
                gnosisNews.all.push(obj);
                obj.img = "gnosis";
            }
            hpNews.all.push(obj);
            if(isFundamentalNew){
                hpNews.fundamental.push(obj);
                if(isEthereumChain) ethereumNews.fundamental.push(obj);
                if(isGnosisChain) gnosisNews.fundamental.push(obj);
            }
            if(isClientNew){
                hpNews.clients.push(obj);
                if(isEthereumChain) ethereumNews.clients.push(obj);
                if(isGnosisChain) gnosisNews.clients.push(obj); 
            }
        }

        fs.writeFile(path.join(__dirname, '..', '..',  app.dataFile.pagecache.news["hp"]), JSON.stringify(hpNews,null, 2), 'utf8', (err) => { if(err) console.log(err); });
        fs.writeFile(path.join(__dirname, '..', '..',  app.dataFile.pagecache.news["gnosis"]), JSON.stringify(gnosisNews,null, 2), 'utf8', (err) => { if(err) console.log(err); });
        fs.writeFile(path.join(__dirname, '..', '..',  app.dataFile.pagecache.news["ethereum"]), JSON.stringify(ethereumNews,null, 2), 'utf8', (err) => { if(err) console.log(err); });
    })

    function formatTimestamp(timestamp) {
        return format(new Date(timestamp), 'dd.MM.yyyy, HH:mm:ss');
    }
    
    function timeAgo(timestamp) {
        const date = new Date(timestamp); // Vytvoření datového objektu z data
        return formatDistanceToNow(date, { addSuffix: true });
    }
};
module.exports = NewsController;

//new NewsController().RegenerateCacheFiles();