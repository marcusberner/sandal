var assert = require("assert");
var sandal = require('../sandal.js');

describe('register a service', function(){

    sandal.clear();
    sandal.register('service', {
        name: 'service name'
    });

    describe('and resolve the service', function(){

        var result = sandal.resolve('service');

        it('should return the service', function(){
            assert.equal(result.name, 'service name');
        });

    });
});

describe('register a service that was already registered', function(){

    sandal.clear();
    sandal.register('service', {
        name: 'service name'
    });
    var error = null;
    try {
        sandal.register('service', {});
    }
    catch (err) {
        error = err;
    }

    it('should throw', function(){
        assert.notEqual(error, null);
    });

});

describe('register a service without implementation', function(){

    sandal.clear();
    var error = null;
    try {
        sandal.register('service');
    }
    catch (err) {
        error = err;
    }

    it('should throw', function(){
        assert.notEqual(error, null);
    });

});

describe('clearing all registered services', function(){

    sandal.clear();
    sandal.register('service', {
        name: 'service name'
    });
    sandal.clear();

    describe('and resolve the service', function(){

        var error = null;
        try {
            sandal.resolve('service');
        }
        catch (err) {
            error = err;
        }

        it('should throw', function() {
            assert.notEqual(error, null);
        });

    });

});

describe('clearing a registered services', function(){

    sandal.clear();
    sandal.register('service1', {
        name: 'service name1'
    });
    sandal.register('service2', {
        name: 'service name2'
    });
    sandal.clear('service1');


    describe('and resolve a service', function(){

        var error = null;
        try {
            sandal.resolve('service1');
        }
        catch (err) {
            error = err;
        }
        var service2 = sandal.resolve('service2');

        it('should throw for cleared service', function() {
            assert.notEqual(error, null);
        });

        it('should resolve non clear service', function() {
            assert.equal(service2.name, 'service name2');
        });

    });

});

describe('register a service with constructor and prototype', function(){

    sandal.clear();
    var constructorCalled = false;
    var service = function () {
        constructorCalled = true;
        this.name = 'service name';
    };
    service.prototype.getName = function() {
        return this.name;
    };
    sandal.register('service', service);

    describe('and resolve the service', function(){

        var result = sandal.resolve('service');

        it('should call the constructor', function(){
            assert.equal(constructorCalled, true);
        });

        it('should have the prototype methods', function(){
            assert.equal(result.getName(), 'service name');
        });

    });
});

describe('register a service with dependencies', function(){

    sandal.clear();
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
    sandal.register('service1', service1);
    sandal.register('service2', service2);
    sandal.register('service3', service3);
    sandal.register('service4', service4);

    describe('and resolve the service', function(){

        var result = sandal.resolve('service1');

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

describe('register a service without defining lifecycle', function(){

    sandal.clear();
    var constructorCallCount = 0;
    var service = function () {
        constructorCallCount++;
        this.name = 'service';
    };
    sandal.register('service', service);

    describe('and resolve the service twice', function(){

        var result1 = sandal.resolve('service');
        var result2 = sandal.resolve('service');

        it('should only call the constructor once', function(){
            assert.equal(constructorCallCount, 1);
        });

        it('should get the same object', function(){
            assert.equal(result1, result2);
        });

    });
});

describe('register a service as singleton', function(){

    sandal.clear();
    var constructorCallCount = 0;
    var service = function () {
        constructorCallCount++;
        this.name = 'service';
    };
    sandal.register('service', service, 'singleton');

    describe('and resolve the service twice', function(){

        var result1 = sandal.resolve('service');
        var result2 = sandal.resolve('service');

        it('should only call the constructor once', function(){
            assert.equal(constructorCallCount, 1);
        });

        it('should get the same object', function(){
            assert.equal(result1, result2);
        });

    });
});

describe('register a service as transient', function(){

    sandal.clear();
    var constructorCallCount = 0;
    var service = function () {
        constructorCallCount++;
        this.name = 'service';
    };
    sandal.register('service', service, 'transient');

    describe('and resolve the service twice', function(){

        var result1 = sandal.resolve('service');
        var result2 = sandal.resolve('service');

        it('should call the constructor twice', function(){
            assert.equal(constructorCallCount, 2);
        });

        it('should not get the same object', function(){
            assert.notEqual(result1, result2);
        });

    });
});

describe('register a service with unknown lifecycle', function(){

    sandal.clear();
    var error = null;
    try {
        sandal.register('service', {}, 'unknown');
    }
    catch (err) {
        error = err;
    }

    it('should throw', function(){
        assert.notEqual(error, null);
    });

});

describe('register a service with circular dependencies', function(){

    sandal.clear();
    var constructorCallCount = 0;
    var service = function () {
        constructorCallCount++;
        this.name = 'service';
    };
    sandal.register('service1', function (service2) {});
    sandal.register('service2', function (service3) {});
    sandal.register('service3', function (service1) {});

    describe('and resolve the service', function(){

        var error = null;
        try {
            sandal.resolve('service1');
        }
        catch (err) {
            error = err;
        }

        it('should throw', function(){
            assert.notEqual(error, null);
        });

    });
});

describe('register a service with comments in constructor', function(){

    sandal.clear();
    var service1 =  /**/function(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
    {
        this.name = 'service1' + service2 + service3;
    };
    sandal.register('service1', service1);
    sandal.register('service2', 'service2');
    sandal.register('service3', 'service3');

    describe('and resolve the service', function(){

        var result = sandal.resolve('service1');

        it('should resolve all dependencies', function(){
            assert.equal(result.name, 'service1service2service3');
        });

    });

});

describe('register a service with alternate syntax comments in constructor', function(){

    sandal.clear();
    var service1 =  /**/function Service(/*Some random comments*/ service2 , /*With $pecial chars*/ service3 /**/) // In various places
    {
        this.name = 'service1' + service2 + service3;
    };
    sandal.register('service1', service1);
    sandal.register('service2', 'service2');
    sandal.register('service3', 'service3');

    describe('and resolve the service', function(){

        var result = sandal.resolve('service1');

        it('should resolve all dependencies', function(){
            assert.equal(result.name, 'service1service2service3');
        });

    });

});