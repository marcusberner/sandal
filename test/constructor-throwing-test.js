
var test = require("tap").test,
	Sandal = require('../sandal.js');

test('Service throws', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.service('service1', function(){
			throw err;
		})
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});

test('Dependency service throws', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.service('service1', function(service2){})
		.service('service2', function(){ throw err; })
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});
