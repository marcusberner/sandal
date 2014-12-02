
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Factory returning undefined', function (t) {

	t.plan(4);

	var sandal = new Sandal(),
        count = 0;

    sandal.factory('myFactory', function () {
        count++;
        return undefined;
    }).resolve(function (err, myFactory) {
            t.equal(myFactory, undefined, 'should return undefined');
            t.equal(count, 1, 'should call the factory');
        });
	sandal.resolve(function (err, myFactory) {
		t.equal(myFactory, undefined, 'should return undefined');
		t.equal(count, 1, 'should not call the factory again');
	});


});