
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Async factory', function (t) {

	t.plan(6);

	var sandal = new Sandal();
	var order = 0;
	var factory1 = function (factory2, factory3) {
		order++;
		t.equal(factory2, 'factory 2', 'should get value from done callback');
		t.equal(order, 4, 'should resolve dependencies in the correct order');
	};
	var factory2 = function (done) {
		order++;
		t.equal(order, 1, 'should resolve dependencies in the correct order');
		setTimeout(function() {
			order++;
			t.equal(order, 3, 'should resolve dependencies in the correct order');
			done(null, 'factory 2');
		}, 100);
	};
	var factory3 = function () {
		order++;
		t.equal(order, 2, 'should resolve dependencies in the correct order');
	};

	sandal.factory('factory1', factory1);
	sandal.factory('factory2', factory2);
	sandal.factory('factory3', factory3);

	sandal.resolve(function(err, factory1) {
		order++;
		t.equal(order, 5, 'should resolve dependencies in the correct order');
	});

});