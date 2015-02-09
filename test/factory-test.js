
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Async factory', function (t) {

	var sandal = new Sandal();
	sandal.factory('myFactory', function () {
		return 'bar';
	});
	sandal.resolve(function(err, myFactory) {
		t.notOk(err);
		t.equal(myFactory, 'bar');
		t.end();
	});

});