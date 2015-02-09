
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Resolve transient service with transient dependencies twice', function (t) {

    var sandal = new Sandal();

    var i = 0;
    var service1 = function (service2) {
        i++;
        this.value =  '' + i + service2.value;
    };

    var j = 0;
    var service2 = function () {
        j++;
        this.value =  j.toString();
    };

    sandal.service('service1', service1, { lifecycle: 'transient' });
    sandal.service('service2', service2, { lifecycle: 'transient' });

    t.plan(2);

    sandal.resolve(function(err, service1) {
        t.equal(service1.value, '11', 'Should create service and dependency');
    });

    sandal.resolve(function(err, service1) {
        t.equal(service1.value,'22', 'Should create service and dependency');
    });

});