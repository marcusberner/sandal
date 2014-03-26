
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Resolve transient factory with async transient dependencies twice', function (t) {

	var sandal = new Sandal();

    var i = 0;
	var factory1 = function (factory2, done) {
        setTimeout(function () {
			i++;
			done(null, i.toString() + factory2);
		}, 10);
	};

    var j = 0;
    var factory2 = function (factory3, done) {
        setTimeout(function () {
			j++;
			done(null, factory3 + j.toString());
		}, 10);
    };

    var k = 0;
    var factory3 = function (done) {
        setTimeout(function () {
			k++;
			done(null, k.toString());
		}, 10);
    };

	sandal.factory('factory1', factory1, true);
    sandal.factory('factory2', factory2, true);
    sandal.factory('factory3', factory3, true);

    t.plan(2);

	sandal.resolve(function(err, factory1) {
		t.equal(factory1, '111', 'Should get a new result and dependency result');
	});

	sandal.resolve(function(err, factory1) {
		t.equal(factory1,'222', 'Should get a new result dependency result');
	});

});