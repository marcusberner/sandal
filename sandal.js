
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

	var resolveService = function(name, resolveChain, callback, done) {

		if (name === 'sandal') {
			callback(exports);
			done();
			return;
		}

		if (!services[name]) {
			throw new Error('No implementation registered for ' + name);
		}

		for (var i = 0; i < resolveChain.length; i++) {
			if (resolveChain[i] === name) {
				resolveChain.push(name);
				throw new Error('There are circular dependencies in resolve chain: ' + resolveChain);
			}
		}
		resolveChain.push(name);

		if (services[name].obj) {
			callback(services[name].obj);
			done();
			return;
		}

		if (services[name].isResolving) {
			services[name].resolvedCallbacks.push(function() {
				callback(services[name].obj);
				done();
			});
			return;
		}
		services[name].isResolving = true;

		if (services[name].constructor) {

			var argumentNames = getArgumentNames(services[name].constructor);
			var dependencyCount = argumentNames.length;
			var dependencies = [];
			var hasDoneCallback = false;

			var resolveCount = -1;
			var dependencyDone = function() {
				resolveCount++;
				if (resolveCount === dependencyCount) {
					var service = Object.create(services[name].constructor.prototype);
					services[name].constructor.prototype.constructor.apply(service, dependencies);
					services[name].obj = service;
					for (var i = 0; i < services[name].resolvedCallbacks.length; i++) {
						services[name].resolvedCallbacks[i]();
					}
					callback(service);
					if (!hasDoneCallback) {
						done();
					}
				}
			};
			dependencyDone();

			for(var i = 0; i < dependencyCount; i++) {

				var index = i;

				if (argumentNames[index] === 'done') {
					hasDoneCallback = true;
					dependencies[index] = function() { done(); }
					dependencyDone();
					continue;
				}

				resolveService(argumentNames[index], resolveChain.slice(0), function(dependency) {
					dependencies[index] = dependency;
				}, dependencyDone);

			}

		}

	};

	exports.registerService = function(name, constructor) {
		if (typeof constructor !== 'function') {
			throw new Error('Service must be a function');
		}
		services[name] = {
			obj: null,
			constructor: constructor,
			isResolving: false,
			resolvedCallbacks: []
		};
		return exports;
	};

	exports.registerObject = function(name, obj) {
		if (!obj) {
			throw new Error('Implementation required');
		}
		services[name] = {
			obj: obj
		};
		return exports;
	};

    exports.resolve = function(arg1, arg2) {

		var callback, serviceNames;
		if (typeof arg1 === 'string') {
			serviceNames = [ arg1 ];
			callback = arg2;
		} else {
			callback = arg1;
		}

		if (typeof callback !== 'function') {
			throw new Error('Callback function required');
		}

		if (!serviceNames) {
			serviceNames = getArgumentNames(callback);
		}

		var serviceCount = serviceNames.length;
		var resolvedCount = 0;
		var resolved = [];
		for (var i = 0; i < serviceCount; i++) {
			var index = i;
			resolveService(serviceNames[index], [], function(svc) {
					resolved[index] = svc;
				},
				function() {
					resolvedCount++;
					if (resolvedCount === serviceCount) {
						 callback.apply({}, resolved);
					}
				});
		}
		return exports;
    };

    exports.clear = function(name) {
        if (name) {
            delete services[name];
            return;
        }
        services = {};
		return exports;
    };

})(typeof exports === 'undefined' ? this['sandal'] = {} : exports);