module.exports = function () {

	var Sandal = require('../sandal.js'),
		sandal = new Sandal();

	sandal
		.factory('db', require('./db/level-db-factory'))
		.object('dataPath', require('path').join(__dirname, '/data'))
		.service('phoneBook', require('./db/phone-book'))
		.service('server', require('./web/server'))
		.object('queryStringParser', require('./web/query-string-parser'))
		.object('templateEngine', require('ejs'))
		.factory('template', require('./web/template-factory'))
		.service('htmlRenderer', require('./web/html-renderer'));

	return sandal;

};