
var test = require("tap").test,
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
			done();
		}, 20);
		return 'I am factory 2';
	};

	var service1 = function (service2) {
		this.dependency = service2.dependency;
	};

	var service2 = function (factory1) {
		this.dependency = factory1;
	};

	sandal.registerFactory('factory1', factory1)
		.registerFactory('factory2', factory2)
		.registerService('service1', service1)
		.registerService('service2', service2)
		.resolve(function (err, service1) {
			t.equal(service1.dependency, 'I am factory 2', 'should get return value from dependency');
		});


});