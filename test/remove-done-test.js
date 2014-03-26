
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Clear done', function (t) {

	t.plan(1);

	var container = new Sandal();
	try {
		container.remove('done');
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});