
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Register and resolve service', function (t) {

	var sandal = new Sandal();
	sandal.service('service', function() {
		this.name = 'service name'
	});

	var result;
	sandal.resolve(function(err, service) {
		t.equal(service.name, 'service name', 'should get the constructed object');
		t.end();
	});

});