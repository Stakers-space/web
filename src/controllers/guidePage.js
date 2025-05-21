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
        res.locals.title = `Full ${res.locals.chainName} staking guide`;
        res.locals.metaDescription = `Full interactive guide for ${res.locals.chainName} staking with various consensus and execution clients, as well as simultaneous staking on multiple chains.`;
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
        res.locals.title = `Solo ${res.locals.chainName} staking Validator guide`;
        res.locals.metaDescription = `Full interactive validator guide to run a validator on ${res.locals.chainName} chain.`;
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
        res.locals.title = `Lido ${res.locals.chainName} staking Validator guide`;
        res.locals.metaDescription = `Full interactive validator guide to run Lido validator on ${res.locals.chainName} chain.`;
        
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        next();
    }
    Rocketpool(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/rocketpool-service';
        res.locals.title = `Rocketpool ${res.locals.chainName} staking Validator guide`;
        res.locals.metaDescription = `Full interactive validator guide to run Rocketpool validator on ${res.locals.chainName} chain.`;
        
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        next();
    }
    Stakewise(req, res, next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/stakewise-service';
        res.locals.title = `StakeWise ${res.locals.chainName} staking Validator guide`;
        res.locals.metaDescription = `Full interactive validator guide to run StakeWise validator on ${res.locals.chainName} chain.`;
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
        res.locals.title = `Hardware for ${res.locals.chainName} staking`;
        res.locals.metaDescription = `What hardware to choose for ${res.locals.chainName} staking?`;
        next();
    }
    Emergency(req,res,next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/emergency-guide';
        res.locals.title = `Emergency guide for ${res.locals.chainName} staking`;
        res.locals.metaDescription = `What to do if anything goes wrong with ${res.locals.chainName} staking?`;
        next();
    }
    ValidatorActions(req,res,next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/validator-actions';
        res.locals.title = `Validator Actions when staking ${res.locals.chainName}`;
        res.locals.metaDescription = `What actions can you perform with your validator when staking ${res.locals.chainName}?`;
        next();
    }

    Maintenance(req,res,next){
        res.locals = app._ExtandLocals(res.locals);
        res.locals.page_hbs = 'guides/maintenance';
        res.locals.title = `Maintenance guide for ${res.locals.chainName} staking`;
        res.locals.executionClient = "nethermind";
        res.locals.consensusClient = "lighthouse";
        res.locals.metaDescription = `What to do to be a valid member in ${res.locals.chainName} staking longterm?`;
        fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.executionClients = clients.executionLayer;
                    res.locals.consensusClients = clients.consensusLayer;
                    res.locals.mevClients = clients.mevLayer;
                } catch (err) {
                    console.error(err);
                }
            }
            next();
        });
    }
}

module.exports = GuidePage;