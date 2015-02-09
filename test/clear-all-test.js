
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Clear all implementations', function (t) {

	t.plan(3);

	var s = new Sandal();
	s.object('myObject', {});
	s.clear();

	s.resolve(function(error, myObject) {
		t.ok(error, 'should get an error when resolving removed component');
	});
	s.resolve(function(error, sandal) {
		t.notOk(error, 'should not get an error for sandal');
		t.equal(sandal, s, 'should get the correct container');
	});

});