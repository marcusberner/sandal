
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Clear one implementation', function (t) {

	t.plan(3);

	var container = new Sandal();
	var service = {};
	container.object('service1', service);
	container.object('service2', {});
	container.remove('service2');
	container.resolve(function(error, service2) {
		t.ok(error, 'should get and error for cleared service');
	});
	container.resolve(function(error, service1) {
		t.ok(!error, 'should not get and error for non-cleared service');
		t.equal(service, service1, 'should get the correct service');
	});

});