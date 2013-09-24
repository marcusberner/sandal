
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register with a name that was already registered', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {});
	try {
		sandal.register('service', {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});