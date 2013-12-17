module.exports = function (dataPath) {

	console.log('Calling level db factory');

	var level = require('level');
	return level(dataPath);


}