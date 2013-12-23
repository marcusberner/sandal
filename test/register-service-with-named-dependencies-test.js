
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register with named dependencies', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var s1 = function (s2, s3) {
		t.ok(true, 'should call the constructor of the service');
		this.name = 'service1' + s2.getName() + s3.getName();
	};
	s1.prototype.getName = function() {
		return this.name;
	};
	var s2 = function () {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service2';
	};
	s2.prototype.getName = function() {
		return this.name;
	};
	var s3 = function (s4) {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service3' + s4.getName();
	};
	s3.prototype.getName = function() {
		return this.name;
	};
	var s4 = function () {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service4';
	};
	s4.prototype.getName = function() {
		return this.name;
	};
	sandal.service('service1', [ 'service2', 'service3' ], s1);
	sandal.service('service2', s2);
	sandal.service('service3', [ 'service4' ], s3);
	sandal.service('service4', s4);

	sandal.resolve(function(err, service1) {
		t.equal(service1.getName(), 'service1service2service3service4', 'should resolve all dependencies with prototype');
	});

});