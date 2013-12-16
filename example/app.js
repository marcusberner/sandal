/**
 * Simple web based Phone book
 */
require('./register-all')().resolve(function (err, server) {

	if (err) {
		console.log(err);
		process.exit(-1);
	}

	server.start();

});