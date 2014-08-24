
var test = require("tape"),
	Sandal = require('../sandal.js'),
	err = new Error('something went wrong'),
	sandal = new Sandal();;

test('Resolve factory with error', function (t) {

	sandal
		.factory('factory', function(done){ done(err); })
		.resolve(function(e, factory) {
			t.equal(e, err, 'should pass the error');
			t.end();
		});

});

test('Resolve factory with error again', function (t) {

	sandal
		.resolve(function(e, factory) {
			t.equal(e, err, 'should pass the error again');
			t.end();
		});

});