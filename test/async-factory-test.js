
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Async factory', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var order = 0;
	var factory1 = function (factory2, factory3) {
		order++;
		t.equal(order, 4, 'should resolve dependencies in the correct order');
	};
	var factory2 = function (done) {
		order++;
		t.equal(order, 1, 'should resolve dependencies in the correct order');
		setTimeout(function() {
			order++;
			t.equal(order, 3, 'should resolve dependencies in the correct order');
			done();
		}, 100);
	};
	var factory3 = function () {
		order++;
		t.equal(order, 2, 'should resolve dependencies in the correct order');
	};

	sandal.registerFactory('factory1', factory1);
	sandal.registerFactory('factory2', factory2);
	sandal.registerFactory('factory3', factory3);

	sandal.resolve(function(err, factory1) {
		order++;
		t.equal(order, 5, 'should resolve dependencies in the correct order');
	});

});