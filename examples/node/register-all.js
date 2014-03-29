module.exports = function () {

	var Sandal = require('sandal'),
		sandal = new Sandal();

	sandal
		.factory('db', require('./level-db-factory'))
		.object('dataPath', require('path').join(__dirname, '/data'))
		.service('phoneBook', require('./phone-book'))
		.factory('server', require('./server'))
		.factory('requestHandler', require('./request-handler'))
		.object('queryStringParser', require('./query-string-parser'))
		.object('templateEngine', require('ejs'))
		.factory('template', require('./template-factory'))
		.factory('htmlRenderer', require('./html-renderer'));

	return sandal;

};