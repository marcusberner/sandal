
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register without implementation', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	try {
		sandal.register('service');
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});