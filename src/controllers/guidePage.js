var app = null;
const fs = require('fs'),
    path = require('path');

class GuidePage {
    constructor(){
        this.layout_hbs = 'standard';
        this.css_file = 'docs';
        app = this;
    }
    _ExtandLocals(locals){
        locals.layout_hbs = this.layout_hbs;
        locals.css_file = this.css_file;
        return locals;
    }

    Base(req,res,next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/full-guide';
        res.locals.title = `Full ${(res.locals.chain === "ethereum") ? "Ethereum" : "Gnosis"} staking guide`;
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.executionClients = clients.executionLayer;
                    res.locals.consensusClients = clients.consensusLayer;
                } catch (err) {
                    console.error(err);
                }
            }
            next();
        });
    }

    Solo(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/solo-validator';
        res.locals.title = "Solo Staking - Validator guide";
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";

        fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.executionClients = clients.executionLayer;
                    res.locals.consensusClients = clients.consensusLayer;
                } catch (err) {
                    console.error(err);
                }
            }
			next();
        });
    }
    Lido(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/lido-service';
        res.locals.title = "Lido Staking guide";
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        next();
    }
    Rocketpool(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/rocketpool-service';
        res.locals.title = "Rocketpool Staking guide";
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        next();
    }
    Stakewise(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/stakewise-service';
        res.locals.title = "StakeWise Staking guide";
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.serviceLayer = clients.serviceLayer;
                } catch (err) {
                    console.error(err);
                }
            }
			next();
        });
    }
    Hardware(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.layout_hbs = "amp"; // rewrite
        res.locals.page_hbs = 'guides/hardware';
        res.locals.title = `Hardware for ${res.locals.title} staking`;
        next();
    }
    Emergency(req,res,next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/emergency-guide';
        res.locals.title = `Emergency guide for ${res.locals.title} staking`;
        next();
    }
}

module.exports = GuidePage;