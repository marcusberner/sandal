
var test = require("tap").test
var Sandal = require('../sandal.js');

test('Register and resolve', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {
		name: 'service name'
	});

	var result;
	sandal.resolve(function(service) {
		t.equal(service.name, 'service name');
	});

});

test('Register and resolve class', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.registerClass('service', function() {
		this.name = 'service name'
	});

	var result;
	sandal.resolve(function(service) {
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
	sandal.registerClass('service1', service1);
	sandal.register('service2', 'service2');
	sandal.register('service3', 'service3');

	sandal.resolve(function(service1) {
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
	sandal.registerClass('service1', service1);
	sandal.register('service2', 'service2');
	sandal.register('service3', 'service3');

	sandal.resolve(function(service1) {
		t.equal(service1.name, 'service1service2service3');
	});

});

test('Independent containers', function (t) {

	t.plan(2);

	var sandal1 = new Sandal();
	var sandal2 = new Sandal();
	sandal1.register('service', 'service1');
	sandal2.register('service', 'service2');

	sandal1.resolve(function(service) {
		t.equal(service, 'service1');
	});
	sandal2.resolve(function(service) {
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

test('Class with a name that was already registered', function (t) {

	t.plan(1);

	var sandal = new Sandal();
	sandal.register('service', {});
	try {
		sandal.registerClass('service', function() {});
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
		sandal.registerClass('service', {});
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

	t.plan(2);

	var container = new Sandal();
	container.register('service', {});
	container.clear();
	try {
		container.resolve(function(service) {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}
	container.resolve(function(sandal) {
		t.equal(sandal, container);
	});

});

test('Clear one implementations', function (t) {

	t.plan(2);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.clear('service2');
	try {
		container.resolve(function(service2) {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}
	container.resolve(function(service1) {
		t.equal(service, service1);
	});

});

test('Clear multiple implementations', function (t) {

	t.plan(3);

	var container = new Sandal();
	var service = {};
	container.register('service1', service);
	container.register('service2', {});
	container.register('service3', {});
	container.clear([ 'service2', 'service3' ]);
	try {
		container.resolve(function(service2) {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}
	try {
		container.resolve(function(service3) {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}
	container.resolve(function(service1) {
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
	sandal.registerClass('service', service);

	sandal.resolve(function(service) {
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
	sandal.registerClass('service1', service1);
	sandal.registerClass('service2', service2);
	sandal.registerClass('service3', service3);
	sandal.registerClass('service4', service4);

	sandal.resolve(function(service1) {
		t.equal(service1.getName(), 'service1service2service3service4');
	});

});

test('Resolve class twice', function (t) {

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
	sandal.registerClass('service', service);

	sandal.resolve(function(service) {
		t.equal(service.getName(), 1);
	});

	sandal.resolve(function(service) {
		t.equal(service.getName(), 1, 'Should get the same instance');
	});

});

test('Circular dependencies', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	sandal.registerClass('service1', function (service2) {});
	sandal.registerClass('service2', function (service3) {});
	sandal.registerClass('service3', function (service1) {});

	try {
		sandal.resolve(function(service1) {});
		t.ok(false);
	}
	catch (err) {
		t.ok(true);
	}

});

test('Async constructor', function (t) {

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

	sandal.registerClass('service1', service1);
	sandal.registerClass('service2', service2);
	sandal.registerClass('service3', service3);

	sandal.resolve(function(service1) {
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

test('Register done class', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.registerClass('done', function() {});
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

	sandal.resolve('service', function(otherName) {
		t.equal(otherName.name, 'service name');
	});

});

test('Resolve multiple', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(function(service1, service2) {
		t.equal(service1.name, 'service name 1');
		t.equal(service2.name, 'service name 2');
	});

});

test('Resolve multiple by name', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	sandal.register('service1', {
		name: 'service name 1'
	});
	sandal.register('service2', {
		name: 'service name 2'
	});

	sandal.resolve(['service1', 'service2'], function(otherName1, otherName2) {
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
		.registerClass('service2', function(){ this.name = 'service name 2'; })
		.resolve(function(service1) {
			t.equal(service1.name, 'service name 1.2');
		})
		.resolve('service2', function(service) {
			t.equal(service.name, 'service name 2');
		});

});
