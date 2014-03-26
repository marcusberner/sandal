
var test = require("tape"),
	Sandal = require('../sandal.js');

test('Factory throws', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.factory('service1', function(){
			throw err;
		})
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});

test('Dependency factory throws', function (t) {

	var err = new Error('something went wrong');
	var sandal = new Sandal();
	sandal
		.factory('service1', function(service2){})
		.factory('service2', function(){ throw err; })
		.resolve(function(error, service1) {
			t.equal(error, err, 'should pass the error');
			t.end();
		});

});