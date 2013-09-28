
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve transient factory with async singleton dependencies twice', function (t) {

	var sandal = new Sandal();

    var i = 0;
	var factory1 = function (factory2, done) {
        i++;
        setTimeout(done, 10);
		return i.toString() + factory2;
	};

    var j = 0;
    var factory2 = function (factory3, done) {
        j++;
        setTimeout(done, 10);
        return factory3 + j.toString();
    };

    var k = 0;
    var factory3 = function (done) {
        k++;
        setTimeout(done, 10);
        return k.toString();
    };

	sandal.registerFactory('factory1', factory1, true);
    sandal.registerFactory('factory2', factory2);
    sandal.registerFactory('factory3', factory3);

    t.plan(2);

	sandal.resolve(function(err, factory1) {
		t.equal(factory1, '111', 'Should get a new result and dependency result');
	});

	sandal.resolve(function(err, factory1) {
		t.equal(factory1,'211', 'Should get a new result and old dependency result');
	});

});