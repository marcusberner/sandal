
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Resolve transient service with async singleton dependencies twice', function (t) {

	var sandal = new Sandal();

    var i = 0;
	var service1 = function (service2, done) {
        var that = this;
        setTimeout(function () {
            i++;
            that.value = i.toString() + service2.value;
            done();
        }, 10);
	};

    var j = 0;
    var service2 = function (service3, done) {
        var that = this;
        setTimeout(function () {
            j++;
            that.value = j.toString() + service3.value;
            done();
        }, 10);
    };

    var k = 0;
    var service3 = function (done) {
        var that = this;
        setTimeout(function () {
            k++;
            that.value = k.toString();
            done();
        }, 10);
    };

	sandal.registerService('service1', service1, true);
    sandal.registerService('service2', service2);
    sandal.registerService('service3', service3);

    t.plan(2);

	sandal.resolve(function(err, service1) {
		t.equal(service1.value, '111', 'Should create service and dependency');
	});

	sandal.resolve(function(err, service1) {
		t.equal(service1.value,'211', 'Should create service but use old dependency');
	});

});