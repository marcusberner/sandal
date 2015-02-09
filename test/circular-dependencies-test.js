
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Circular dependencies', function (t) {

	var sandal = new Sandal();

	sandal.service('service1', function (service2) {});
	sandal.service('service2', function (service3) {});
	t.throws(function () {
		sandal.service('service3', function (service1) {});
	});
	t.end();


});