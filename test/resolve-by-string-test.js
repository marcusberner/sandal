
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve by name', function (t) {

	var sandal = new Sandal();
	sandal.register('service', {
		name: 'service name'
	});

	sandal.resolve('service', function(err, otherName) {
		t.equal(otherName.name, 'service name', 'should get service');
		t.end();
	});

});

test('Resolve multiple by name', function (t) {

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(['service1', 'service2'], function(err, otherName1, otherName2) {
		t.ok(!err, 'should not return an error');
		t.equal(otherName1.name, 'service name 1', 'should get services');
		t.equal(otherName2.name, 'service name 2', 'should get services');
		t.end();
	});

});