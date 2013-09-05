var assert = require("assert");
var sandal = require('../sandal.js');

describe('sandal: ', function() {

	beforeEach(function(done){
		sandal.clear();
		done();
	});

	describe('register a service', function(){

		it('and resolve the service', function(done){

			sandal.registerObject('service', {
				name: 'service name'
			});

			var result;
			sandal.resolve(function(service) {
				result = service;
				done();
			});

			it('should return the service', function(){
				assert.equal(result.name, 'service name');
			});

		});
	});

	describe('register a service with comments in constructor', function(){

		it('and resolve the service', function(done){

			var service1 =  /**/function(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
			{
				this.name = 'service1' + service2 + service3;
			};
			sandal.registerService('service1', service1);
			sandal.registerObject('service2', 'service2');
			sandal.registerObject('service3', 'service3');

			var result;
			sandal.resolve(function(service1) {
				result = service1;
				done();
			});

			it('should resolve all dependencies', function(){
				assert.equal(result.name, 'service1service2service3');
			});

		});

	});

	describe('register a service with alternate syntax comments in constructor', function(){

		it('and resolve the service', function(done){

			var service1 =  /**/function Service(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
			{
				this.name = 'service1' + service2 + service3;
			};
			sandal.registerService('service1', service1);
			sandal.registerObject('service2', 'service2');
			sandal.registerObject('service3', 'service3');

			var result;
			sandal.resolve(function(service1) {
				result = service1;
				done();
			});

			it('should resolve all dependencies', function(){
				assert.equal(result.name, 'service1service2service3');
			});

		});

	});

	it('register a service that was already registered', function(){

		sandal.registerObject('service', {
			name: 'service name'
		});
		var error = null;
		try {
			sandal.registerObject('service', {});
		}
		catch (err) {
			error = err;
		}

		it('should throw', function(){
			assert.notEqual(error, null);
		});

	});

	it('register a service without implementation', function(){

		var error = null;
		try {
			sandal.registerObject('service');
		}
		catch (err) {
			error = err;
		}

		it('should throw', function(){
			assert.notEqual(error, null);
		});

	});

	it('clearing all registered services', function(){

		sandal.registerObject('service', {
			name: 'service name'
		});
		sandal.clear();

		it('and resolve the service', function(){

			var error = null;
			try {
				sandal.resolve(function(service) {});
			}
			catch (err) {
				error = err;
			}

			it('should throw', function() {
				assert.notEqual(error, null);
			});

		});

	});

	it('clearing a registered services', function(){

		it('and resolve a service', function(done){

			sandal.registerObject('service1', {
				name: 'service name1'
			});
			sandal.registerObject('service2', {
				name: 'service name2'
			});
			sandal.clear('service1');

			var error = null;
			try {
				sandal.resolve(function(service1) {});
			}
			catch (err) {
				error = err;
			}
			var s2;
			sandal.resolve(function(service2) {
				s2 = service2;
				done();
			});

			it('should throw for cleared service', function() {
				assert.notEqual(error, null);
			});

			it('should resolve non clear service', function() {
				assert.equal(s2.name, 'service name2');
			});

		});

	});

	it('register a service with constructor and prototype', function(){

		it('and resolve the service', function(done){

			var constructorCalled = false;
			var service = function () {
				constructorCalled = true;
				this.name = 'service name';
			};
			service.prototype.getName = function() {
				return this.name;
			};
			sandal.registerService('service', service);

			var result;
			sandal.resolve(function(service) {
				result = service;
				done();
			});

			it('should call the constructor', function(){
				assert.equal(constructorCalled, true);
			});

			it('should have the prototype methods', function(){
				assert.equal(result.getName(), 'service name');
			});

		});
	});

	it('register a service with dependencies', function(){

		it('and resolve the service', function(){

			var constructorCalled1 = false;
			var constructorCalled2 = false;
			var constructorCalled3 = false;
			var constructorCalled4 = false;
			var service1 = function (service2, service3) {
				constructorCalled1 = true;
				this.name = 'service1' + service2.getName() + service3.getName();
			};
			service1.prototype.getName = function() {
				return this.name;
			};
			var service2 = function () {
				constructorCalled2 = true;
				this.name = 'service2';
			};
			service2.prototype.getName = function() {
				return this.name;
			};
			var service3 = function (service4) {
				constructorCalled3 = true;
				this.name = 'service3' + service4.getName();
			};
			service3.prototype.getName = function() {
				return this.name;
			};
			var service4 = function () {
				constructorCalled4 = true;
				this.name = 'service4';
			};
			service4.prototype.getName = function() {
				return this.name;
			};
			sandal.registerService('service1', service1);
			sandal.registerService('service2', service2);
			sandal.registerService('service3', service3);
			sandal.registerService('service4', service4);

			var result;
			sandal.resolve(function(service1) {
				result = service1;
				done();
			});

			it('should call the constructor of service and all dependencies', function(){
				assert.equal(constructorCalled1, true);
				assert.equal(constructorCalled2, true);
				assert.equal(constructorCalled3, true);
				assert.equal(constructorCalled4, true);
			});

			it('should have the prototype methods for all dependencies', function(){
				assert.equal(result.getName(), 'service1service2service3service4');
			});

		});
	});

	it('register a service', function(){

		it('and resolve the service twice', function(done){

			var constructorCallCount = 0;
			var service = function () {
				constructorCallCount++;
				this.name = 'service';
			};
			sandal.registerService('service', service);

			var firstDone = false;
			var result1, result2;
			sandal.resolve(function(service) {
				result1 = service;
				if (firstDone) {
					done();
				}
				firstDone = true;
			})
				.resolve(function(service) {
					result2 = service;
					if (firstDone) {
						done();
					}
					firstDone = true;
				});

			it('should only call the constructor once', function(){
				assert.equal(constructorCallCount, 1);
			});

			it('should get the same object', function(){
				assert.equal(result1, result2);
			});

		});
	});

	it('register a service with circular dependencies', function(){

		var constructorCallCount = 0;
		var service = function () {
			constructorCallCount++;
			this.name = 'service';
		};
		sandal.registerService('service1', function (service2) {});
		sandal.registerService('service2', function (service3) {});
		sandal.registerService('service3', function (service1) {});

		it('and resolve the service', function(){

			var error = null;
			try {
				sandal.resolve(function(service1) {});
			}
			catch (err) {
				error = err;
			}

			it('should throw', function(){
				assert.notEqual(error, null);
			});

		});
	});

});
