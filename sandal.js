var services = {};
var injectFcnName = 'inject';

var getArgumentNames = function(func) {
    var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null) {
        result = [];
    }
    return result;
};

var resolveDependencies = function(fcn, resolveChain) {
    var argumentNames = getArgumentNames(fcn);
    var arguments = [];
    for (var i = 0; i < argumentNames.length; i++) {
        arguments.push(resolve(argumentNames[i], resolveChain));
    }
    return arguments;
};

var callConstructor = function(fcn, resolveChain) {
    var arguments = resolveDependencies(fcn, resolveChain);
    var service = {};
    fcn.prototype.constructor.apply(service, arguments);
    return service;
};

var callInjectMethod = function(obj, resolveChain) {
    var arguments = resolveDependencies(obj[injectFcnName], resolveChain);
    obj[injectFcnName].apply(obj, arguments);
    return obj;
};

var resolve = function(name, resolveChain) {

    for (var i = 0; i < resolveChain.length; i++) {
        if (resolveChain[i] === name) {
            resolveChain.push(name);
            throw new Error('There are circular dependencies in the following the resolve chain: ' + resolveChain);
        }
    }
    resolveChain.push(name);

    if (services[name]) {

        if (services[name].initiated) {
            return services[name].implementation;
        }

        if (typeof services[name].implementation === 'function') {
            services[name].implementation = callConstructor(services[name].implementation, resolveChain);
        }

        if (services[name].implementation && typeof services[name].implementation[injectFcnName] === 'function') {
            services[name].implementation = callInjectMethod(services[name].implementation, resolveChain);
        }

        services[name].initiated = true;
        return services[name].implementation;
    }

    throw new Error('No component registered for ' + name);

};


module.exports.register = function(name, implementation) {
    if (services[name]) {
        throw new Error('The service was already registered: ' + name);
    }
    services[name] = { initiated: false, implementation: implementation };
};

module.exports.resolve = function(name) {
    return resolve(name, []);
};