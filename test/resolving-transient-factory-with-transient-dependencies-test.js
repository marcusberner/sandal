
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Resolve transient factory with transient dependencies twice', function (t) {

	var sandal = new Sandal();

    var i = 0;
	var factory1 = function (factory2) {
        i++;
		return '' + i + factory2;
	};

    var j = 0;
    var factory2 = function () {
        j++;
        return j.toString();
    };

	sandal.factory('factory1', factory1, true);
    sandal.factory('factory2', factory2, true);

    t.plan(2);

	sandal.resolve(function(err, factory1) {
		t.equal(factory1, '11', 'Should get a new result dependency result');
	});

	sandal.resolve(function(err, factory1) {
		t.equal(factory1,'22', 'Should get a new result dependency result');
	});

});