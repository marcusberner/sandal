
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Async factory under service', function (t) {

	var isDone = false,
		sandal = new Sandal();

	t.plan(3);

	var factory1 = function (factory2) {
		t.equal(factory2, 'I am factory 2', 'should get return value from dependency');
		t.ok(isDone, 'should wait for dependency');
		return factory2;
	};

	var factory2 = function (done) {
		setTimeout(function() {
			isDone = true;
			done(null, 'I am factory 2');
		}, 20);
	};

	var service1 = function (service2) {
		this.dependency = service2.dependency;
	};

	var service2 = function (factory1) {
		this.dependency = factory1;
	};

	sandal.factory('factory1', factory1)
		.factory('factory2', factory2)
		.service('service1', service1)
		.service('service2', service2)
		.resolve(function (err, service1) {
			t.equal(service1.dependency, 'I am factory 2', 'should get return value from dependency');
		});


});