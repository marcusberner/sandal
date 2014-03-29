module.exports = function (phoneBook, htmlRenderer, queryStringParser) {

	return function (req, res) {

		var query = queryStringParser.parse(req.url);

		var sendPhoneBook = function () {
			phoneBook.getAll(function (err, items) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(htmlRenderer.renderItems(items));
			});
		};

		if (query.name && query.number) {
			phoneBook.put(query.name, query.number, function () {
				sendPhoneBook();
			});
		} else {
			sendPhoneBook();
		}

	};

};
