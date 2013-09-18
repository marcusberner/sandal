
var test = require("tap").test
var Sandal = require('../sandal.js');

test('Register and resolve', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {
		name: 'service name'
	});

	var result;
	sandal.resolve(function(err, service) {
		t.equal(service.name, 'service name');
	});

});

test('Register and resolve service', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.registerService('service', function() {
		this.name = 'service name'
	});

	var result;
	sandal.resolve(function(err, service) {
		t.equal(service.name, 'service name');
	});

});

test('Register and resolve factory', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.registerFactory('service', function() {
		return {
			name: 'service name'
		};
	});

	sandal.resolve(function(err, service) {
		t.equal(service.name, 'service name');
	});

});

test('Comments in constructor', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	var service1 =  /**/function(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
	{
		this.name = 'service1' + service2 + service3;
	};
	sandal.registerService('service1', service1);
	sandal.register('service2', 'service2');
	sandal.register('service3', 'service3');

	sandal.resolve(function(err, service1) {
		t.equal(service1.name, 'service1service2service3');
	});

});

test('Comments in named constructor', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	var service1 =  /**/function Service(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
	{
		this.name = 'service1' + service2 + service3;
	};
	sandal.registerService('service1', service1);
	sandal.register('service2', 'service2');
	sandal.register('service3', 'service3');

	sandal.resolve(function(err, service1) {
		t.equal(service1.name, 'service1service2service3');
	});

});

test('Independent containers', function (t) {

	t.plan(2);

	var sandal1 = new Sandal();
	var sandal2 = new Sandal();
	sandal1.register('service', 'service1');
	sandal2.register('service', 'service2');

	sandal1.resolve(function(err, service) {
		t.equal(service, 'service1');
	});
	sandal2.resolve(function(err, service) {
		t.equal(service, 'service2');
	});

});

test('Register with a name that was already registered', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {});
	try {
		sandal.register('service', {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Service with a name that was already registered', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {});
	try {
		sandal.registerService('service', function() {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Register constructor that is not a function', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	try {
		sandal.registerService('service', {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Register without implementation', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	try {
		sandal.register('service');
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Clear all implementations', function (t) {

	t.plan(3);

	var container = new Sandal();
	container.register('service', {});
	container.clear();

	container.resolve(function(error, service) {
		t.notEqual(error, undefined);
	});
	container.resolve(function(error, sandal) {
		t.equal(error, undefined);
		t.equal(sandal, container);
	});

});

test('Clear one implementations', function (t) {

	t.plan(3);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.clear('service2');
	container.resolve(function(error, service2) {
		t.notEqual(error, undefined);
	});
	container.resolve(function(error, service1) {
		t.equal(error, undefined);
		t.equal(service, service1);
	});

});

test('Clear multiple implementations', function (t) {

	t.plan(4);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.register('service3', {});
	container.clear([ 'service2', 'service3' ]);
	container.resolve(function(error, service2) {
		t.notEqual(error, undefined);
	});
	container.resolve(function(error, service3) {
		t.notEqual(error, undefined);
	});
	container.resolve(function(error, service1) {
		t.equal(error, undefined);
		t.equal(service, service1);
	});

});

test('Clear sandal', function (t) {

	t.plan(1);

	var container = new Sandal();
	try {
		container.clear('sandal');
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Clear done', function (t) {

	t.plan(1);

	var container = new Sandal();
	try {
		container.clear('done');
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Clear error', function (t) {

	t.plan(1);

	var container = new Sandal();
	try {
		container.clear('error');
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Constructor and prototype', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	var service = function () {
		t.ok(true);
		this.name = 'service name';
	};
	service.prototype.getName = function() {
		return this.name;
	};
	sandal.registerService('service', service);

	sandal.resolve(function(err, service) {
		t.equal(service.getName(), 'service name');
	});

});

test('Constructor with dependencies', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var service1 = function (service2, service3) {
		t.ok(true);
		this.name = 'service1' + service2.getName() + service3.getName();
	};
	service1.prototype.getName = function() {
		return this.name;
	};
	var service2 = function () {
		t.ok(true);
		this.name = 'service2';
	};
	service2.prototype.getName = function() {
		return this.name;
	};
	var service3 = function (service4) {
		t.ok(true);
		this.name = 'service3' + service4.getName();
	};
	service3.prototype.getName = function() {
		return this.name;
	};
	var service4 = function () {
		t.ok(true);
		this.name = 'service4';
	};
	service4.prototype.getName = function() {
		return this.name;
	};
	sandal.registerService('service1', service1);
	sandal.registerService('service2', service2);
	sandal.registerService('service3', service3);
	sandal.registerService('service4', service4);

	sandal.resolve(function(err, service1) {
		t.equal(service1.getName(), 'service1service2service3service4');
	});

});

test('Resolve service twice', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	var i = 0;
	var service = function () {
		i++;
		this.name = i;
	};
	service.prototype.getName = function() {
		return this.name;
	};
	sandal.registerService('service', service);

	sandal.resolve(function(err, service) {
		t.equal(service.getName(), 1);
	});

	sandal.resolve(function(err, service) {
		t.equal(service.getName(), 1, 'Should get the same instance');
	});

});

test('Circular dependencies', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	sandal.registerService('service1', function (service2) {});
	sandal.registerService('service2', function (service3) {});
	sandal.registerService('service3', function (service1) {});

	sandal.resolve(function(error, service1) {
		t.notEqual(error, undefined);
	});

});

test('Async service constructor', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var order = 0;
	var service1 = function (service2, service3) {
		order++;
		t.equal(order, 4);
	};
	var service2 = function (done) {
		order++;
		t.equal(order, 1);
		setTimeout(function() {
			order++;
			t.equal(order, 3);
			done();
		}, 100);
	};
	var service3 = function () {
		order++;
		t.equal(order, 2);
	};

	sandal.registerService('service1', service1);
	sandal.registerService('service2', service2);
	sandal.registerService('service3', service3);

	sandal.resolve(function(err, service1) {
		order++;
		t.equal(order, 5);
	});

});

test('Async factory constructor', function (t) {

	t.plan(5);

	var sandal = new Sandal();
	var order = 0;
	var service1 = function (service2, service3) {
		order++;
		t.equal(order, 4);
	};
	var service2 = function (done) {
		order++;
		t.equal(order, 1);
		setTimeout(function() {
			order++;
			t.equal(order, 3);
			done();
		}, 100);
	};
	var service3 = function () {
		order++;
		t.equal(order, 2);
	};

	sandal.registerFactory('service1', service1);
	sandal.registerFactory('service2', service2);
	sandal.registerFactory('service3', service3);

	sandal.resolve(function(err, service1) {
		order++;
		t.equal(order, 5);
	});

});

test('Register done', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.register('done', {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Register done service', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.registerService('done', function() {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Resolve by name', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {
		name: 'service name'
	});

	sandal.resolve('service', function(err, otherName) {
		t.equal(otherName.name, 'service name');
	});

});

test('Resolve multiple', function (t) {

	t.plan(3);

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(function(error, service1, service2) {
		t.equal(error, undefined);
		t.equal(service1.name, 'service name 1');
		t.equal(service2.name, 'service name 2');
	});

});

test('Resolve multiple by name', function (t) {

	t.plan(3);

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(['service1', 'service2'], function(err, otherName1, otherName2) {
		t.equal(err, undefined);
		t.equal(otherName1.name, 'service name 1');
		t.equal(otherName2.name, 'service name 2');
	});

});

test('Fluent', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	sandal
		.register('service1', { name: 'service name 1' })
		.clear()
		.register('service1', { name: 'service name 1.2' })
		.registerService('service2', function(){ this.name = 'service name 2'; })
		.resolve(function(err, service1) {
			t.equal(service1.name, 'service name 1.2');
		})
		.resolve('service2', function(err, service) {
			t.equal(service.name, 'service name 2');
		});

});

test('Error in constructor', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerService('service1', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Error in dependency constructor', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerService('service1', function(service2){})
		.registerService('service2', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Error in factory', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerFactory('service1', function(done){ done(err); })
		.resolve(function(e, service1) {
			t.equal(e, err);
		});

});

test('Error in dependency factory', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerFactory('service1', function(service2){})
		.registerFactory('service2', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Factory throws', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerFactory('service1', function(){
			throw err;
		})
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Dependency factory throws', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerFactory('service1', function(service2){})
		.registerFactory('service2', function(){ throw err; })
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Service throws', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerService('service1', function(){
			throw err;
		})
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});

test('Dependency service throws', function (t) {

	t.plan(1);

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.registerService('service1', function(service2){})
		.registerService('service2', function(){ throw err; })
		.resolve(function(error, service1) {
			t.equal(error, err);
		});

});