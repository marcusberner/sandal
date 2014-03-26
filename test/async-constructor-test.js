
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Async service constructor', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var order = 0;
	var service1 = function (service2, service3) {
		order++;
		t.equal(order, 4, 'should resolve dependencies in the correct order');
	};
	var service2 = function (done) {
		order++;
		t.equal(order, 1, 'should resolve dependencies in the correct order');
		setTimeout(function() {
			order++;
			t.equal(order, 3, 'should resolve dependencies in the correct order');
			done();
		}, 100);
	};
	var service3 = function () {
		order++;
		t.equal(order, 2, 'should resolve dependencies in the correct order');
	};

	sandal.service('service1', service1);
	sandal.service('service2', service2);
	sandal.service('service3', service3);

	sandal.resolve(function(err, service1) {
		order++;
		t.equal(order, 5, 'should resolve dependencies in the correct order');
	});

});