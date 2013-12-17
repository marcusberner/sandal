var Server = function (requestHandler) {

	console.log('Creating server');

	this.server = require('http').createServer(function (req, res) {
		requestHandler.handle(req, res);
	});

};

Server.prototype.start = function () {
	this.server.listen(1337);
	console.log('Service started on port 1337');

}

module.exports = Server;