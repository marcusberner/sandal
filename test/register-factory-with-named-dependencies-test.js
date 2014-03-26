
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Register with named dependencies', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var f1 = function (f2, f3) {
		t.ok(true, 'should call the factory');
		return 'factory1' + f2 + f3;
	};
	var f2 = function () {
		t.ok(true, 'should call the factory');
		return 'factory2';
	};
	var f3 = function (f4) {
		t.ok(true, 'should call the factory');
		return 'factory3' + f4;
	};
	var f4 = function () {
		t.ok(true, 'should call the factory');
		return 'factory4';
	};
	sandal.factory('factory1', [ 'factory2', 'factory3' ], f1);
	sandal.factory('factory2', f2);
	sandal.factory('factory3', [ 'factory4' ], f3);
	sandal.factory('factory4', f4);

	sandal.resolve(function(err, factory1) {
		t.equal(factory1, 'factory1factory2factory3factory4', 'should resolve all dependencies');
	});

});