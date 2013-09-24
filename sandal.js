'use strict';

var getArgumentNames = function(func) {

	var functionString, argumentList;

	functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
	argumentList = functionString.slice(functionString.indexOf('(')+1, functionString.indexOf(')')).match(/([^\s,]+)/g);
	if(argumentList === null) {
		argumentList = [];
	}
	return argumentList;

};

var resolveService = function(name, services, resolveChain, callback, done) {

	var i, index, argumentNames, dependencyCount, dependencies, hasDoneCallback, resolveCount, dependencyDone, obj;

	if (!services[name]) {
		done(new Error('No implementation registered for ' + name));
		return;
	}

	for (i = 0; i < resolveChain.length; i++) {
		if (resolveChain[i] === name) {
			resolveChain.push(name);
			done(new Error('There are circular dependencies in resolve chain: ' + resolveChain));
			return;
		}
	}
	resolveChain.push(name);

	if (typeof services[name].obj !== 'undefined') {
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

	if (services[name].klass || services[name].factory) {

		argumentNames = getArgumentNames(services[name].klass || services[name].factory)
		dependencyCount = argumentNames.length;
		dependencies = [];
		hasDoneCallback = false;

		resolveCount = -1;
		dependencyDone = function(err) {
			resolveCount++;
			if (resolveCount === dependencyCount) {
				if (services[name].klass) {
					try {
						obj = Object.create(services[name].klass.prototype);
						services[name].klass.prototype.constructor.apply(obj, dependencies);
					} catch (err) {
						done(err);
					}
				} else {
					try {
						obj = services[name].factory.apply(null, dependencies);
					} catch (err) {
						done(err);
					}
				}
				services[name].obj = obj;
				for (var i = 0; i < services[name].resolvedCallbacks.length; i++) {
					services[name].resolvedCallbacks[i]();
				}
				callback(obj);
				if (!hasDoneCallback) {
					done(err);
				}
				delete services[name].klass;
				delete services[name].factory;
				delete services[name].resolvedCallbacks;
				delete services[name].isResolving;
			}
		};
		dependencyDone();

		for(i = 0; i < dependencyCount; i++) {

			(function(index) {
				if (argumentNames[index] === 'done') {
					hasDoneCallback = true;
					dependencies[index] = function(err) { done(err); }
					dependencyDone();
					return;
				}

				resolveService(argumentNames[index], services, resolveChain.slice(0), function(dependency) {
					dependencies[index] = dependency;
				}, dependencyDone);
			})(i);

		}

	}

};

var Sandal = function() {
	this.clear();
};

Sandal.prototype.registerService = function(name, klass) {
	if (typeof klass !== 'function') {
		throw new Error('Service must be a function');
	}
	if (name === 'done' || this.services[name]) {
		throw new Error('There is already an implementation registered with the name ' + name);
	}
	this.services[name] = {
		obj: undefined,
		klass: klass,
		isResolving: false,
		resolvedCallbacks: []
	};
	return this;
};

Sandal.prototype.registerFactory = function(name, factory) {
	if (typeof factory !== 'function') {
		throw new Error('Function required');
	}
	if (name === 'done' || this.services[name]) {
		throw new Error('There is already an implementation registered with the name ' + name);
	}
	this.services[name] = {
		obj: undefined,
		factory: factory,
		isResolving: false,
		resolvedCallbacks: []
	};
	return this;
};

Sandal.prototype.register = function(name, obj) {
	if (typeof obj === 'undefined') {
		throw new Error('Implementation required');
	}
	if (name === 'done' || this.services[name]) {
		throw new Error('There is already an implementation registered with the name ' + name);
	}
	this.services[name] = {
		obj: obj
	};
	return this;
};

Sandal.prototype.resolve = function(arg1, arg2) {

	var that, callback, serviceNames, serviceCount, resolvedCount, resolved, i, index;

	that = this;
	if (typeof arg1 === 'string') {
		serviceNames = [ arg1 ];
		callback = arg2;
	} else if (typeof arg1 === 'function') {
		callback = arg1;
	} else {
		serviceNames = arg1;
		callback = arg2;
	}

	if (typeof callback !== 'function') {
		throw new Error('Callback function required');
	}

	if (!serviceNames) {
		serviceNames = getArgumentNames(callback);
		serviceNames = serviceNames.splice(1);
	}

	serviceCount = serviceNames.length;
	resolvedCount = 0;
	resolved = [];
	for (i = 0; i < serviceCount; i++) {
		index = i;
		resolveService(serviceNames[index], that.services, [], function(svc) {
				resolved[index + 1] = svc;
			},
			function(err) {
				resolved[0] = err;
				resolvedCount++;
				if (resolvedCount === serviceCount) {
					callback.apply({}, resolved);
				}
			});
	}
	return this;
};

Sandal.prototype.clear = function(names) {

	if (!names) {
		this.services = {
			sandal: {
				obj: this
			}
		};
		return this;
	}

	if (typeof names === 'string') {
		names = [ names ];
	}

	for (var i = 0; i < names.length; i++) {
		if (names[i] === 'sandal' || names[i] === 'done' || names[i] === 'error') {
			throw new Error('Clearing sandal, done or error is not allowed');
		}
		delete this.services[names[i]];
	}
	return this;
};

if (typeof module === 'undefined' || typeof module.exports  === 'undefined') {
	this['Sandal'] = Sandal;
} else {
	module.exports = Sandal;
}
