
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Comments in constructor', function (t) {

	var sandal = new Sandal();
	var service1 =  /**/function(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
	{
		this.name = 'service1' + service2 + service3;
	};
	sandal.service('service1', service1);
	sandal.object('service2', 'service2');
	sandal.object('service3', 'service3');

	sandal.resolve(function(err, service1) {
		t.equal(service1.name, 'service1service2service3', 'should resolve all dependencies correctly');
		t.end();
	});

});

test('Comments in named constructor', function (t) {

	var sandal = new Sandal();
	var service1 =  /**/function Service(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
	{
		this.name = 'service1' + service2 + service3;
	};
	sandal.service('service1', service1);
	sandal.object('service2', 'service2');
	sandal.object('service3', 'service3');

	sandal.resolve(function(err, service1) {
		t.equal(service1.name, 'service1service2service3', 'should resolve all dependencies correctly');
		t.end();
	});

});