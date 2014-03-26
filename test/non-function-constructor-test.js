
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Register constructor that is not a function', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	try {
		sandal.service('service', {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});