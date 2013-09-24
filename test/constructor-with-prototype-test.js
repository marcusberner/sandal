
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Constructor and prototype', function (t) {

	t.plan(2);

	var sandal = new Sandal();
	var service = function () {
		t.ok(true, 'should call the constructor');
		this.name = 'service name';
	};
	service.prototype.getName = function() {
		return this.name;
	};
	sandal.registerService('service', service);

	sandal.resolve(function(err, service) {
		t.equal(service.getName(), 'service name', 'should get the prototype functions');
	});

});