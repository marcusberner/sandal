
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Adding tag with name of other dependency', function (t) {

	var sandal = new Sandal();

	sandal.object('object1', 'o1');
	try {
		sandal.object('object2', 'o2', [ 'object1' ]);
	} catch (e) {
		t.ok(e, 'should fail');
		t.end();
	}

});

test('Adding tag with name done', function (t) {

	var sandal = new Sandal();

	try {
		sandal.object('object1', 'o1', [ 'done' ]);
	} catch (e) {
		t.ok(e, 'should fail');
		t.end();
	}

});

test('Adding tag with name sandal', function (t) {

	var sandal = new Sandal();

	try {
		sandal.object('object1', 'o1', [ 'sandal' ]);
	} catch (e) {
		t.ok(e, 'should fail');
		t.end();
	}

});

test('Adding dependency with name of tag', function (t) {

	var sandal = new Sandal();

	sandal.object('object1', 'o1', [ 'object2' ]);
	try {
		sandal.object('object2', 'o2');
	} catch (e) {
		t.ok(e, 'should fail');
		t.end();
	}

});