
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Fluent', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	sandal
		.register('service1', { name: 'service name 1' })
		.clear()
		.register('service1', { name: 'service name 1.2' })
		.registerService('service2', function(){ this.name = 'service name 2'; })
		.resolve(function(err, service1) {
			t.equal(service1.name, 'service name 1.2');
		})
		.resolve('service2', function(err, service) {
			t.equal(service.name, 'service name 2');
		});

});