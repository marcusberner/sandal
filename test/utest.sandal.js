module.exports = {

    registerServiceWithoutDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithoutDependencies', {
            name: 'testService'
        });
        var service = sandal.resolve('serviceWithoutDependencies');

        test.equal(service.name, 'testService', 'Should get the registered service');
        test.done();

    },

    registerServiceWithInitMethod: function(test) {

        var sandal = require('../sandal.js');
        var initiated = 0;
        sandal.register('serviceWithInitMethod', {
            name: 'testService2',
            init: function() {
                initiated++;
            }
        });
        var service = sandal.resolve('serviceWithInitMethod');
        var service2 = sandal.resolve('serviceWithInitMethod');

        test.equal(service2.name, 'testService2', 'Should get the registered service');
        test.equal(initiated, 1, 'Should call the init method on first resolve');
        test.done();

    },

    registerServiceWithDependencies: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceA', {
            inner: undefined,
            init: function(serviceB) {
               this.inner = serviceB;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceB', {
            inner: undefined,
            init: function(serviceC) {
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
            init: function(serviceB2, serviceC2) {
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
            init: function(serviceB3) {
            }
        });
        sandal.register('serviceB3', {
            init: function(serviceC3) {
            }
        });
        sandal.register('serviceC3', {
            init: function(serviceA3) {
            }
        });
        var error;
        try {
            var service = sandal.resolve('serviceA3');
        }
        catch(err) {
            error = err;
        }

        test.equal(error, 'There are circular dependencies in the following the resolve chain: serviceA3,serviceB3,serviceC3,serviceA3',
            'Should trow with helpful message');
        test.done();

    },

    registerServiceWithComments: function(test) {

        var sandal = require('../sandal.js');
        sandal.register('serviceWithCommentsA', {
            inner: undefined,
            init: function(serviceWithCommentsB) {
                this.inner = serviceWithCommentsB;
            },
            getData: function() {
                return this.inner.getData();
            }
        });
        sandal.register('serviceWithCommentsB', {
            inner: undefined,
            init: /**/function(/*Some random comments*/ serviceWithCommentsC /*With $pecial chars*/) // In various places
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

        test.equal(error, 'The service was already registered: myService', 'Should trow with helpful message');
        test.done();

    }

};
