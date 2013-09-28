
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve nothing', function (t) {

	var sandal = new Sandal();

	sandal.resolve(function(error) {
		t.ok(!error, 'should not return error');
		t.end();
	});

});