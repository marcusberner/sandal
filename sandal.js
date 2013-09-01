
(function(exports){

    var services = {};

    var getArgumentNames = function(func) {
        var functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
        var argumentList = functionString.slice(functionString.indexOf('(')+1, functionString.indexOf(')')).match(/([^\s,]+)/g);
        if(argumentList === null) {
            argumentList = [];
        }
        return argumentList;
    };

    var resolveDependencies = function(fcn, resolveChain) {
        var dependencyNames = getArgumentNames(fcn);
        var dependencies = [];
        for (var i = 0; i < dependencyNames.length; i++) {
            dependencies.push(resolve(dependencyNames[i], resolveChain.slice(0)));
        }
        return dependencies;
    };

    var callConstructor = function(fcn, resolveChain) {
        var dependencies = resolveDependencies(fcn, resolveChain);
        var service = Object.create(fcn.prototype);
        fcn.prototype.constructor.apply(service, dependencies);
        return service;
    };

    var resolve = function(name, resolveChain) {

        if (services[name]) {

            if (services[name].singleton) {
                return services[name].singleton;
            }

            for (var i = 0; i < resolveChain.length; i++) {
                if (resolveChain[i] === name) {
                    resolveChain.push(name);
                    throw new Error('There are circular dependencies. Resolve chain: ' + resolveChain);
                }
            }
            resolveChain.push(name);

            var service = services[name].implementation;
            if (typeof service === 'function') {
                service = callConstructor(service, resolveChain);
            }

            if (services[name].lifecycle === 'singleton') {
                services[name].singleton = service;
            }

            return service;

        }

        throw new Error('No service registered for ' + name);

    };


    exports.register = function(name, implementation, lifecycle) {

        if (services[name]) {
            throw new Error('The service was already registered: ' + name);
        }
        if (!implementation) {
            throw new Error('Implementation required');
        }
        if (!lifecycle) {
            lifecycle = 'singleton';
        }
        if (lifecycle !== 'singleton' && lifecycle !== 'transient') {
            throw new Error('Invalid lifecycle');
        }
        services[name] = { lifecycle: lifecycle, implementation: implementation, singleton: null };

    };

    exports.resolve = function(name) {
        return resolve(name, []);
    };

    exports.clear = function(name) {
        if (name) {
            delete services[name];
            return;
        }
        services = {};
    };

})(typeof exports === 'undefined' ? this['sandal'] = {} : exports);