
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register and resolve', function (t) {

	var sandal = new Sandal();

	sandal.object('service', {
		name: 'service name'
	});

	sandal.resolve(function(err, service) {
		t.equal(service.name, 'service name', 'should get the registered implementation');
		t.end();
	});

});