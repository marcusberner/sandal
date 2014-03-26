
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Clear all implementations', function (t) {

	t.plan(3);

	var container = new Sandal();
	container.object('service', {});
	container.clear();

	container.resolve(function(error, service) {
		t.ok(error, 'should get an error for cleared service');
	});
	container.resolve(function(error, sandal) {
		t.ok(!error, 'should not get an error for sandal');
		t.equal(sandal, container, 'should get the correct container');
	});

});