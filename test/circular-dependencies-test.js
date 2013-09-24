
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Circular dependencies', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	sandal.registerService('service1', function (service2) {});
	sandal.registerService('service2', function (service3) {});
	sandal.registerService('service3', function (service1) {});

	sandal.resolve(function(error, service1) {
		t.ok(error, 'should get an error');
	});

});