
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Clear multiple implementations', function (t) {

	t.plan(4);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.register('service3', {});
	container.clear([ 'service2', 'service3' ]);
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