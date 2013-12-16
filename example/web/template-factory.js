module.exports = function (done) {

	console.log('Calling template factory');

	var templateFile = require('path').join(__dirname, '/template.ejs');
	require('fs').readFile(templateFile, { encoding: 'utf8' } , done);

};