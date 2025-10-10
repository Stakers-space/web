'use strict';

class StakersSpace {
	constructor() {
		/**
		 * Define server
		 */
		this.app = require('./server.js').create("--- Stakers.space ---",8080,"public");

		// http listener - pages
		this.app.use(require('./controllers/wwwRemovalController').wwwRemoval);

		/*
		* Define routes - list of pages
		* ( url mapping for containers )
		*/
		this.app.use(require('./routes'));
	}
}
new StakersSpace();