
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Resolve as service', function (t) {

	var sandal = new Sandal();
	var service1 = function (factory2) {
		this.data = 'service 1 with ' + factory2;
	};
	var factory2 = function (done) {
		setTimeout(function() {
			done(null, 'factory 2');
		}, 100);
	};

	sandal.factory('factory2', factory2);

	sandal.resolveAsService(service1, function(err, service1) {
		t.notOk(err, 'should not fail');
		t.equal(service1.data, 'service 1 with factory 2', 'should resolve factory with dependencies');
		t.end();
	});

});

test('Resolve as service with named parameters', function (t) {

	t.plan(4);

	var sandal = new Sandal();
	var count = 0;
	var service1 = function (prefix, count) {
		this.data = prefix + count;
	};
	var countFactory = function () {
		return count++;
	};

	sandal.object('prefix', 'p_');
	sandal.object('prefix2', 'p2_');
	sandal.factory('countFactory', countFactory, true);

	sandal.resolveAsService(service1, [ 'prefix', 'countFactory' ], function(err, service1) {
		t.notOk(err, 'should not fail');
		t.equal(service1.data, 'p_0', 'should resolve service with dependencies');
	});

	sandal.resolveAsService(service1, [ 'prefix2', 'countFactory' ], function(err, service1) {
		t.notOk(err, 'should not fail');
		t.equal(service1.data, 'p2_1', 'should resolve service with dependencies');
	});

});