
var test = require("tap").test,
	Sandal = require('../sandal.js');


test('Register done', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.object('done', {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});

test('Register done service', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.service('done', function() {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});

test('Register done factory', function (t) {

	t.plan(1);

	var sandal = new Sandal();

	try {
		sandal.factory('done', function() {});
		t.ok(false, 'should throw');
	}
	catch (err) {
		t.ok(true, 'should throw');
	}

});