
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Has implementations', function (t) {

	var container = new Sandal();
	container.object('obj', {});

	t.ok(container.has('obj'), 'Should have object');
	t.ok(container.has('sandal'), 'Should have sandal');
	t.notOk(container.has('obj2'), 'Should not have non-registered');
	t.end();



});