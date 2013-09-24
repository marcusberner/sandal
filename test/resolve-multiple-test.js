
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve multiple', function (t) {

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(function(error, service1, service2) {
		t.ok(!error, 'should not return error');
		t.equal(service1.name, 'service name 1', 'should resolve the services');
		t.equal(service2.name, 'service name 2', 'should resolve the services');
		t.end();
	});

});