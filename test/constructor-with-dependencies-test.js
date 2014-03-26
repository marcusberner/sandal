
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Constructor with dependencies', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var service1 = function (service2, service3) {
		t.ok(true, 'should call the constructor of the service');
		this.name = 'service1' + service2.getName() + service3.getName();
	};
	service1.prototype.getName = function() {
		return this.name;
	};
	var service2 = function () {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service2';
	};
	service2.prototype.getName = function() {
		return this.name;
	};
	var service3 = function (service4) {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service3' + service4.getName();
	};
	service3.prototype.getName = function() {
		return this.name;
	};
	var service4 = function () {
		t.ok(true, 'should call the constructor of the dependency');
		this.name = 'service4';
	};
	service4.prototype.getName = function() {
		return this.name;
	};
	sandal.service('service1', service1);
	sandal.service('service2', service2);
	sandal.service('service3', service3);
	sandal.service('service4', service4);

	sandal.resolve(function(err, service1) {
		t.equal(service1.getName(), 'service1service2service3service4', 'should resolve all dependencies with prototype');
	});

});