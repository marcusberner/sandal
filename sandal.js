var registered = {};

var getArgumentNames = function(func) {
    var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null) {
        result = [];
    }
    return result;
};

var resolve = function(name, resolveChain) {

    for (var i = 0; i < resolveChain.length; i++) {
        if (resolveChain[i] === name) {
            resolveChain.push(name);
            throw 'There are circular dependencies in the following the resolve chain: ' + resolveChain;
        }
    }
    resolveChain.push(name);

    if (registered[name]) {
        if (registered[name].initiated) {
            return registered[name].implementation;
        }
        if (registered[name].implementation && typeof registered[name].implementation.init === 'function') {
            var argumentNames = getArgumentNames(registered[name].implementation.init);
            var arguments = [];
            for (var i = 0; i < argumentNames.length; i++) {
                arguments.push(resolve(argumentNames[i], resolveChain));
            }
            registered[name].implementation.init.apply(registered[name].implementation, arguments);
        }
        registered[name].initiated = true;
        return registered[name].implementation;
    }

    throw 'No component registered for ' + name;

};


module.exports.register = function(name, implementation) {
    if (registered[name]) {
        throw 'The service was already registered: ' + name;
    }
    registered[name] = { initiated: false, implementation: implementation };
};

module.exports.resolve = function(name) {
    return resolve(name, []);
};