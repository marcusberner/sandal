module.exports = {

    registerServiceWithoutDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithoutDependencies', {
            name: 'testService'
        });
        var service = sandal.resolve('serviceWithoutDependencies');

        test.equal(service.name, 'testService', 'Should get the services service');
        test.done();

    },

    registerServiceWithConstructorMethod: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithConstructor', function () {
            this.name = 'serviceWithConstructor';
        });
        var service = sandal.resolve('serviceWithConstructor');
        var service2 = sandal.resolve('serviceWithConstructor');

        test.equal(service2.name, 'serviceWithConstructor', 'Should get the constructor output');
        test.done();

    },

    registerServiceWithConstructorAndDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithConstructorA', function () {
            this.name = 'serviceWithConstructorA';
        });
        sandal.register('serviceWithConstructorB', function () {
            this.name = 'serviceWithConstructorB';
        });
        sandal.register('serviceWithConstructorC', function (serviceWithConstructorA, serviceWithConstructorB) {
            this.name = 'serviceWithConstructorC';
            this.innerName = serviceWithConstructorA.name + serviceWithConstructorB.name;
        });
        var serviceC = sandal.resolve('serviceWithConstructorC');

        test.equal(serviceC.innerName, 'serviceWithConstructorAserviceWithConstructorB', 'Should resolve and inject the dependency');
        test.done();

    },

    registerServiceWithCommonDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithConstructorA3', function (commonService) {
            this.name = 'serviceWithConstructorA';
        });
        sandal.register('serviceWithConstructorB3', function (commonService) {
            this.name = 'serviceWithConstructorB';
        });
        sandal.register('serviceWithConstructorC3', function (serviceWithConstructorA3, serviceWithConstructorB3, commonService) {
            this.name = 'serviceWithConstructorC';
            this.innerName = serviceWithConstructorA3.name + serviceWithConstructorB3.name;
        });
        sandal.register('commonService', {});
        var serviceC = sandal.resolve('serviceWithConstructorC3');

        test.equal(serviceC.innerName, 'serviceWithConstructorAserviceWithConstructorB', 'Should resolve and inject the dependency');
        test.done();

    },

    registerServiceWithInjectMethod: function(test) {

        var sandal = require('../sandal.js');
        var initiated = 0;
        sandal.register('serviceWithInitMethod', {
            name: 'testService2',
            inject: function() {
                initiated++;
            }
        });
        var service = sandal.resolve('serviceWithInitMethod');
        var service2 = sandal.resolve('serviceWithInitMethod');

        test.equal(service2.name, 'testService2', 'Should get the services service');
        test.equal(initiated, 1, 'Should call the inject method on first resolve');
        test.done();

    },

    registerServiceWithDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceA', {
            inner: undefined,
            inject: function(serviceB) {
               this.inner = serviceB;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceB', {
            inner: undefined,
            inject: function(serviceC) {
                this.inner = serviceC;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceC', {
            getData: function() {
                return 'Data from service C'
            }
        });
        var service = sandal.resolve('serviceA');

        test.equal(service.getData(), 'Data from service C', 'Should inject and initialize dependencies');
        test.done();

    },

    registerServiceWithMultipleDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceA2', {
            innerB: undefined,
            innerC: undefined,
            inject: function(serviceB2, serviceC2) {
                this.innerB = serviceB2;
                this.innerC = serviceC2;
            },
            getData: function() {
                return this.innerB.getData() + this.innerC.getData();
            }
        });
        sandal.register('serviceB2', {
            getData: function() {
                return 'Data from B'
            }
        });
        sandal.register('serviceC2', {
            getData: function() {
                return ' and from C'
            }
        });
        var service = sandal.resolve('serviceA2');

        test.equal(service.getData(), 'Data from B and from C', 'Should inject and initialize dependencies');
        test.done();

    },

    registerServiceWithCircularDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceA3', {
            inject: function(serviceB3) {
            }
        });
        sandal.register('serviceB3', {
            inject: function(serviceC3) {
            }
        });
        sandal.register('serviceC3', {
            inject: function(serviceA3) {
            }
        });
        var error;
        try {
            var service = sandal.resolve('serviceA3');
        }
        catch(err) {
            error = err;
        }

        test.deepEqual(error, new Error('There are circular dependencies in the following the resolve chain: serviceA3,serviceB3,serviceC3,serviceA3'),
            'Should trow with helpful message');
        test.done();

    },

    registerServiceWithCommentsInInjectMethod: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithCommentsA', {
            inner: undefined,
            inject: function(serviceWithCommentsB) {
                this.inner = serviceWithCommentsB;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceWithCommentsB', {
            inner: undefined,
            inject: /**/function(/*Some random comments*/ serviceWithCommentsC /*With $pecial chars*/) // In various places
            {
                this.inner = serviceWithCommentsC;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceWithCommentsC', {
            getData: function() {
                return 'Data from service C'
            }
        });
        var service = sandal.resolve('serviceWithCommentsA');

        test.equal(service.getData(), 'Data from service C', 'Should inject and initialize dependencies');
        test.done();

    },

    registerServiceWithCommentsInConstructor: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithCommentsA2', function(serviceWithCommentsB) {
            this.inner = serviceWithCommentsB;
            this.getData = function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceWithCommentsB2', /**/function(/*Some random comments*/ serviceWithCommentsC /*With $pecial chars*/) // In various places
            {
            this.inner = serviceWithCommentsC,
            this.getData = function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceWithCommentsC2', function () {
            this.getData = function() {
                return 'Data from service C'
            }
        });
        var service = sandal.resolve('serviceWithCommentsA');

        test.equal(service.getData(), 'Data from service C', 'Should inject and initialize dependencies');
        test.done();

    },

    overridingAService: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('myService', {});
        var error;
        try {
            sandal.register('myService', {});
        }
        catch(err) {
            error = err;
        }

        test.deepEqual(error, new Error('The service was already services: myService'), 'Should trow with helpful message');
        test.done();

    }

};
