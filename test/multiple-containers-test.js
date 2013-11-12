
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Multiple containers', function (t) {

	t.plan(2);

	var sandal1 = new Sandal();
	var sandal2 = new Sandal();
	sandal1.object('service', 'service1');
	sandal2.object('service', 'service2');

	sandal1.resolve(function(err, service) {
		t.equal(service, 'service1', 'should get the service from the first container');
	});
	sandal2.resolve(function(err, service) {
		t.equal(service, 'service2', 'should get the service from the second container');
	});

});