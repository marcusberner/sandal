
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Fluent', function (t) {

	var sandal = new Sandal();
	sandal
		.object('service1', { name: 'service name 1' })
		.clear()
		.object('service1', { name: 'service name 1.2' })
		.service('service2', function(){ this.name = 'service name 2'; })
		.resolve(function(err, service1) {
			t.equal(service1.name, 'service name 1.2');
			t.end();
		});

});