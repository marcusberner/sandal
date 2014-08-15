
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Extend container', function (t) {

	t.plan(4);

	var Extended = Sandal.extend(function (constructor, isConstructor) {
		t.equal(isConstructor, true, 'should indicate that input is a constructor');
		t.equal(Sandal, constructor, 'should pass constructor to extension');
		constructor.prototype.test = function () {
			return 'test data';
		}
	});
	t.equal(Extended, Sandal, 'should return the constructor');

	var sandal = new Extended();
	t.equal(sandal.test(), 'test data', 'should add extensions to new containers');

});