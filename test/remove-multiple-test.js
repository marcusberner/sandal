
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Removing multiple implementations', function (t) {

	t.plan(4);

	var container = new Sandal();
	var service = {};
	container.object('service1', service);
	container.object('service2', {});
	container.object('service3', {});
	container.remove([ 'service2', 'service3' ]);
	container.resolve(function(error, service2) {
		t.ok(error, 'should return error for cleared service');
	});
	container.resolve(function(error, service3) {
		t.ok(error, 'should return error for cleared service');
	});
	container.resolve(function(error, service1) {
		t.ok(!error, 'should not return error for non-cleared service');
		t.equal(service, service1, 'should return the non-cleared service');
	});

});