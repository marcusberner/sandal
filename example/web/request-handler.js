var RequestHandler = function (phoneBook, htmlRenderer, queryStringParser) {

	console.log('Creating request handler');

	this.phoneBook = phoneBook;
	this.htmlRenderer = htmlRenderer;
	this.queryStringParser = queryStringParser;
};

RequestHandler.prototype.handle = function (req, res) {

	var that = this,
		query = this.queryStringParser.parse(req.url),
		sendResponse = function (err) {
			if (err) {
				res.writeHead(500, {'Content-Type': 'text/plain'});
				res.end(err);
			} else {
				that.phoneBook.getAll(function (err, items) {
					if (err) {
						return sendResponse(err);
					}
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.end(that.htmlRenderer.renderItems(items));
				});
			}

		};

	if (query.name && query.number) {
		this.phoneBook.put(query.name, query.number, function (err) {
			sendResponse(err);
		});
	} else {
		sendResponse();
	}

};

module.exports = RequestHandler;