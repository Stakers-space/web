"use strict";

var app = null;
const fs = require('fs'),
	  path = require('path');

class ClientPagePresenter { 
	constructor(){
		app = this;
	}
    
	Request(req, res, next){   
		const segments = req.originalUrl.split('?')[0].split('/').filter(Boolean);
		let client = null;
		let clientSegment = "overview";
		res.locals.hbsTemplate = "client";
		if (segments.length === 1) {
			client = segments[0];
		} else if (segments.length === 2) {
			// URL has 2 segments - /install, /update, /add-validator, /exit-validator
			client = segments[0];
			clientSegment = segments[1];
			res.locals.hbsTemplate = "client_"+clientSegment;
		} else {
			return res.status(404).send('Requested page does not exists.');
		}
		//console.log(segments, "→", client, clientSegment);

		// required for default client selection
		res.locals.executionClient = "nethermind";
		res.locals.consensusClient = "lighthouse";
		switch(client){
			case 'nethermind':
				res.locals.client = "nethermind"; // due to selectbar
				res.locals.executionClient = "nethermind"; // due to selectbar
				res.locals.clientName = "Nethermind";
				res.locals.cliPartial = "clients/nethermind_cli";
				res.locals.cliConfigPartial = "clients/nethermind_cli_config";
				res.locals.cliLayer = "execution";
				break;
			case 'erigon':
				res.locals.client = "erigon";
				res.locals.executionClient = "erigon";
				res.locals.clientName = "Erigon";
				res.locals.cliPartial = "clients/erigon_cli";
				res.locals.cliConfigPartial = "clients/erigon_cli_config";
				res.locals.cliLayer = "execution";
				break;
			case 'geth':
				res.locals.client = "geth";
				res.locals.executionClient = "geth";
				res.locals.clientName = "Geth";
				res.locals.cliPartial = "clients/geth_cli";
				res.locals.cliConfigPartial = "clients/geth_cli_config";
				res.locals.cliLayer = "execution";
				break;
			case 'reth':
				res.locals.client = "reth";
				res.locals.executionClient = "reth";
				res.locals.clientName = "Reth";
				res.locals.cliPartial = "clients/reth_cli";
				res.locals.cliConfigPartial = "clients/reth_cli_config";
				res.locals.cliLayer = "execution";
				break;
			case 'besu':
				res.locals.client = "besu";
				res.locals.executionClient = "besu";
				res.locals.clientName = "Besu";
				res.locals.cliPartial = "clients/besu_cli";
				res.locals.cliConfigPartial = "clients/besu_cli_config";
				res.locals.cliLayer = "execution";
				break;
			case 'lighthouse':
				res.locals.client = "lighthouse";
				res.locals.consensusClient = "lighthouse";
				res.locals.clientName = "Lighthouse";
				res.locals.cliPartial = "clients/lighthouse_cli";
				res.locals.cliConfigPartial = "clients/lighthouse_cli_config";
				res.locals.partial2ToLoad = "clients/lighthouse_validator";
				res.locals.cliLayer = "consensus";
				break;
			case 'lodestar':
				res.locals.client = "lodestar";
				res.locals.consensusClient = "lodestar";
				res.locals.clientName = "Lodestar";
				res.locals.cliPartial = "clients/lodestar_cli";
				res.locals.cliConfigPartial = "clients/lodestar_cli_config";
				res.locals.partial2ToLoad = "clients/lodestar_validator";
				res.locals.cliLayer = "consensus";
				break;
			case 'teku':
				res.locals.client = "teku";
				res.locals.consensusClient = "teku";
				res.locals.clientName = "Teku";
				res.locals.cliPartial = "clients/teku_cli";
				res.locals.cliConfigPartial = "clients/teku_cli_config";
				res.locals.partial2ToLoad = "clients/teku_validator";
				res.locals.cliLayer = "consensus";
				break;
			case 'prysm':
				res.locals.client = "prysm";
				res.locals.consensusClient = "prysm";
				res.locals.clientName = "Prysm";
				res.locals.cliPartial = "clients/prysm_cli";
				res.locals.cliConfigPartial = "clients/prysm_cli_config";
				res.locals.partial2ToLoad = "clients/prysm_validator";
				res.locals.cliLayer = "consensus";
				break;
			case 'mev-boost':
				res.locals.clientName = "Mev-boost";
				res.locals.cliPartial = "clients/mevboost";
				res.locals.cliLayer = "mev";
				break;
			default:
				// default clients page
				res.locals.hbsTemplate = "clients";
				res.locals.cliLayer = "all";
		}

		fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
					switch(res.locals.cliLayer){
						case 'execution':
							res.locals.cliData = clients.executionLayer[client];
							break
						case 'consensus':
							res.locals.cliData = clients.consensusLayer[client];
							break;
						case 'mev':
							//if(client === "mev-boost") ...
							break;
						case 'service':

							break;
						default: // clients page
							res.locals.executionClients_arr = Object.values(clients.executionLayer);
							res.locals.consensusClients_arr = Object.values(clients.consensusLayer);
							res.locals.mevClients_arr = Object.values(clients.mevLayer);
							res.locals.serviceClients_arr = Object.values(clients.serviceLayer);
							break;
					}
					//executionClients = clients.executionLayer;
                    //res.locals.consensusClients = clients.consensusLayer;
					res.locals.executionClients = clients.executionLayer;
					res.locals.consensusClients = clients.consensusLayer;
					res.locals.mevClients = clients.mevLayer;
					res.locals.serviceClients = clients.serviceLayer;
					
                } catch (err) {
                    console.error(err);
                }
            }
			next();
        });
	};

	ClientsOverview(req,res,next){
		res.locals.page_hbs = "clients";
		res.locals.layout_hbs = "amp";
		res.locals.css_file = "docs";
		// load data
		fs.readFile(path.join(__dirname, '..', '..', 'data/clients.json'), 'utf8', (err, data) => {
            if(!err) {
                try {
                    const clients = JSON.parse(data);
                    res.locals.executionClients = clients.executionLayer;
                    res.locals.consensusClients = clients.consensusLayer;
					res.locals.mevClients = clients.mevLayer;
					res.locals.serviceClients = clients.serviceLayer;

					res.locals.executionClients_arr = Object.values(clients.executionLayer);
					res.locals.consensusClients_arr = Object.values(clients.consensusLayer);
					res.locals.mevClients_arr = Object.values(clients.mevLayer);
					res.locals.serviceClients_arr = Object.values(clients.serviceLayer);

                } catch (err) {
                    console.error(err);
                }
            }
			next();
        });
	}
}

module.exports = ClientPagePresenter;