
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Non-registered dependency', function (t) {

	var sandal = new Sandal();

	sandal
		.service('service1', function(service2, done){
			setTimeout(done, 100);
		})
		.service('service2', function(service3, done){
			setTimeout(done, 100);
		})
		.resolve(function(error, service1) {
			t.ok(error, 'should return error');
			t.end();
		});

});