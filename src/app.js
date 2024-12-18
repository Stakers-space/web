'use strict';

class StakersSpace {
	constructor() {
		/**
		 * Define server
		 * http://localhost:3011
		 */
		this.app = require('./server.js').create("--- Stakers.space ---",8080,"public");

		// http listener - pages
		this.wwwRemoval();

		/*
		* Define routes - list of pages
		* ( url mapping for containers )
		*/
		this.app.use(require('./routes'));

		// crons to update cache files?
	}

	wwwRemoval() {
		const wwwRemovalController = require('./controllers/wwwRemovalController');
		this.app.use(wwwRemovalController.wwwRemoval);
	}
}
new StakersSpace();