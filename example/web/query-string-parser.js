module.exports.parse = function (url) {
	return require('url').parse(url, true).query;
};