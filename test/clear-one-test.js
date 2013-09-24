
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Clear one implementation', function (t) {

	t.plan(3);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.clear('service2');
	container.resolve(function(error, service2) {
		t.ok(error, 'should get and error for cleared service');
	});
	container.resolve(function(error, service1) {
		t.ok(!error, 'should not get and error for non-cleared service');
		t.equal(service, service1, 'should get the correct service');
	});

});