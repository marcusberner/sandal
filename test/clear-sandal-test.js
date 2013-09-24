
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Clear sandal', function (t) {

	t.plan(1);

	var container = new Sandal();
	try {
		container.clear('sandal');
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});