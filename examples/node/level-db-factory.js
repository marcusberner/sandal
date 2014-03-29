module.exports = function (dataPath) {
	var level = require('level');
	return level(dataPath);
};