var Server = function (phoneBook, htmlRenderer, queryStringParser) {

	console.log('Creating a server');

	this.server = require('http').createServer(function (req, res) {

		var query = queryStringParser.parse(req.url),
			sendResponse = function (err) {
				if (err) {
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.end(err);
				} else {
					phoneBook.getAll(function (err, items) {
						if (err) {
							return sendResponse(err);
						}
						res.writeHead(200, {'Content-Type': 'text/html'});
						res.end(htmlRenderer.renderItems(items));
					});
				}

			};


		if (query.name && query.number) {
			phoneBook.put(query.name, query.number, function (err) {
				sendResponse(err);
			});
		} else {
			sendResponse();
		}

	});

};

Server.prototype.start = function () {
	this.server.listen(1337);
	console.log('Service started on port 1337');

}

module.exports = Server;