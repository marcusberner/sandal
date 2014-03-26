
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Factory with sync done', function (t) {

	var sandal = new Sandal();

	sandal.factory('factory', function (done) {
		done(null, 'something');
	});

	sandal.resolve(function(err, factory) {
		t.notOk(err, 'should not fail');
		t.equal(factory, 'something', 'should get the correct factory');
		t.end();
	});

});