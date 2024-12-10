"use strict";

const router = require('express').Router();
const HPController = require('../controllers/homePage');
const EthereumController = require('../controllers/ethereum');
const GnosisController = require('../controllers/gnosis');
const ChartController = require('../controllers/charts');
const NewsController = require('../controllers/news');
const cacheRegenerateToken = require('../config/config.secret.json').cacheRegenerateToken;

/**
 * Recreate cached files (rewrite files that were deployed from the localhost)
 */

class CacheReGenerate {
    constructor(){
        router.get('/generate', this.RegenerateCache);
    }

    RegenerateCache(req, res){
        console.log("regenerate cache", req.query);
        if(req.query.st !== cacheRegenerateToken) return res.status(500).send("Unauthorized access");
        
        new NewsController().RegenerateCacheFiles(); // Reload news ()

        console.log("Updating UpdatePageRelatedCacheFiles");
        new ChartController().CacheData(function(err){ // Cache all DB data into file
            console.log((err) ? err : "└── Chart Data were succesfully cached | Caching pages-related data");
            var callbacks = 3;
            // Use the data from the file
            new EthereumController().CacheIndexData(function(err){
                console.log((err) ? err : " ├─ Ethereum Data were succesfully cached");
                PageCached();
            });

            new GnosisController().CacheIndexData(function(err){
                console.log((err) ? err : " ├─ Gnosis Data were succesfully cached");
                PageCached();
            });

            // Run Homepage index cron
            new HPController().CacheIndexData(function(err){
                console.log((err) ? err : " ├─ HP Data were succesfully cached");
                PageCached();
            });

            function PageCached(){
                callbacks--;
                if(callbacks===0) {
                    console.log(" └── All pages cached");
                    // mention to log
                    res.send("ok");
                }
            }
        });
    }
}

new CacheReGenerate();
module.exports = router;