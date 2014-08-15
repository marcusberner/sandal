
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Extend container', function (t) {

	t.plan(3);

	var sandal = new Sandal(),
		returnValue = sandal.extend(function (container, isConstructor) {
			t.equal(isConstructor, false, 'should indicate that input is not a constructor');
			t.equal(sandal, container, 'should pass container to extension');
		});
	t.equal(returnValue, sandal, 'should return the container');

});