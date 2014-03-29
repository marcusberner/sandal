module.exports = function (requestHandler) {
	var server = require('http').createServer(requestHandler);
	return {
		start: function () {
			server.listen(1337);
			console.log('Service started on port 1337');
		}
	};
};
