
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Service with sync done', function (t) {

	var sandal = new Sandal();

	sandal.service('service', function (done) {
		this.getSomething = function () {
			return 'something';
		}
		done();
	});

	sandal.resolve(function(err, service) {
		t.notOk(err, 'should not fail');
		t.ok(service, 'should get a service');
		t.equal(service.getSomething(), 'something', 'should get a working service');
		t.end();
	});

});