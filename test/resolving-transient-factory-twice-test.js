
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve service twice', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	var i = 0;
	var factory = function () {
        i++;
		return i;
	};

	sandal.factory('factory', factory, 'transient');

	sandal.resolve(function(err, factory) {
		t.equal(factory, 1, 'Should get the return value');
	});

	sandal.resolve(function(err, factory) {
		t.equal(factory, 2, 'Should get a new return value');
	});

});