
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register constructor that is not a function', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	try {
		sandal.registerService('service', {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});