
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Resolve as factory', function (t) {

	var sandal = new Sandal();
	var factory1 = function (factory2) {
		return 'factory 1 with ' + factory2;
	};
	var factory2 = function (done) {
		setTimeout(function() {
			done(null, 'factory 2');
		}, 100);
	};

	sandal.factory('factory2', factory2);

	sandal.resolveAsFactory(factory1, function(err, factory1) {
		t.notOk(err, 'should not fail');
		t.equal(factory1, 'factory 1 with factory 2', 'should resolve factory with dependencies');
		t.end();
	});

});

test('Resolve as factory with named parameters', function (t) {

	t.plan(4);

	var sandal = new Sandal();
	var count = 0;
	var factory1 = function (prefix, count) {
		return prefix + count;
	};
	var countFactory = function () {
		return count++;
	};

	sandal.object('prefix', 'p_');
	sandal.object('prefix2', 'p2_');
	sandal.factory('countFactory', countFactory, { lifecycle: 'transient' });

	sandal.resolveAsFactory(factory1, {
		dependencies: [ 'prefix', 'countFactory' ]
	}, function(err, factory1) {
		t.notOk(err, 'should not fail');
		t.equal(factory1, 'p_0', 'should resolve factory with dependencies');
	});

	sandal.resolveAsFactory(factory1, { dependencies: [ 'prefix2', 'countFactory' ] }, function(err, factory1) {
		t.notOk(err, 'should not fail');
		t.equal(factory1, 'p2_1', 'should resolve factory with dependencies');
	});

});