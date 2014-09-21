
var test = require("tape"),
	Sandal = require('../sandal.js'),
	internalContainer = new Sandal(),
	container1 = new Sandal(),
	container2 = new Sandal();

container1.internal(internalContainer);
container2.internal(internalContainer);

test('Share internal container', function (t) {

	internalContainer.factory('randomNumber', function () {
		return Math.random();
	});

	container1.factory('randomString', function(randomNumber) {
		return randomNumber.toString();
	}, true);

	container2.factory('randomString', function(randomNumber) {
		return randomNumber.toString();
	}, true);

	container1.resolve(['randomString', 'randomNumber'], function(error, randomString1, randomNumber1) {
		t.notOk(error, 'should not fail');
		container1.resolve(['randomString', 'randomNumber'], function(error, randomString2, randomNumber2) {
			t.notOk(error, 'should not fail');
			t.equal(randomString1, randomString2, 'should use the same internal dependency');
			t.ok(randomNumber1, 'should resolve directly from internal container');
			t.ok(randomNumber2, 'should resolve directly from internal container');
			t.equal(randomNumber1, randomNumber2, 'should resolve directly from internal container');
			t.end();
		});
	});

});

test('Overwrite internal component', function (t) {

	container1.factory('randomNumber', function () {
		return 123;
	});

	container2.factory('randomNumber', function() {
		return 456;
	});

	container1.resolve('randomString', function(error, randomString1) {
		t.notOk(error, 'should not fail');
		t.equal(randomString1, '123', 'should use own components before internal container');
		container2.resolve('randomString', function(error, randomString2) {
			t.notOk(error, 'should not fail');
			t.equal(randomString2, '456', 'should use own components before internal container');
			t.end();
		});
	});

});