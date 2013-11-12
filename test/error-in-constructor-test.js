
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Error in constructor', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.service('service1', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});

test('Error in dependency constructor', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.service('service1', function(service2){})
		.service('service2', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});