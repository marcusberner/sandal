
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Error in factory', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.factory('service1', function(done){ done(err); })
		.resolve(function(e, service1) {
			t.equal(e, err, 'should pass the error');
			t.end();
		});

});

test('Error in dependency factory', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.factory('service1', function(service2){})
		.factory('service2', function(done){ done(err); })
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});