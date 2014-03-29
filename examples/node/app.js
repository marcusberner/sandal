/**
 * Simple web based Phone book
 *
 * Get started:
 * 	npm install
 * 	node app.js
 * 	Browse to http://localhost:1337
 *
 * Data is stored in the folder ./data that will be created automatically
 * Remove the folder to clear the database
 */

require('./register-all')().resolve(function (err, server) {

	if (err) {
		console.log('Resolve error', err);
		process.exit(-1);
	}

	server.start();

});