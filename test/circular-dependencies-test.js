
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Circular dependencies', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	sandal.service('service1', function (service2) {});
	sandal.service('service2', function (service3) {});
	sandal.service('service3', function (service1) {});

	sandal.resolve(function(error, service1) {
		t.ok(error, 'should get an error');
	});

});