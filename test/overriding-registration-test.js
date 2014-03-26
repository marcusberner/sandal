
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Register with a name that was already registered', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.object('service', {});
	try {
		sandal.object('service', {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});