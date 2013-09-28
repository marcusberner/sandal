'use strict';

var Sandal = (function () {

	var _getArgumentNames = function(func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(')+1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if(argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	var _hasCircularDependencies = function (dependencyNames, resolveChain) {
		var i, j;
		for (var j = 0; j < dependencyNames.length; j++) {
			for (var i = 0; i < resolveChain.length; i++) {
				if (resolveChain[i] === dependencyNames[j]) {
					return true;
				}
			}
		}
		return false;
	};

	var _callResolvedCallbacks = function (err, service) {
		for (var i = 0; i < service.resolvedCallbacks.length; i++) {
			service.resolvedCallbacks[i](err);
		}
		service.resolvedCallbacks = [];
		service.isResolving = false;
	};

	var _createObject = function (service, dependencies) {
		if (service.klass) {
			try {
				service.obj = Object.create(service.klass.prototype);
				service.klass.prototype.constructor.apply(service.obj, dependencies);
			} catch (err) {
				_callResolvedCallbacks(err, service);
				return;
			}
		} else {
			try {
				service.obj = service.factory.apply(null, dependencies);
			} catch (err) {
				_callResolvedCallbacks(err, service);
				return;
			}
		}
	};

	var _resolve = function(name, services, resolveChain, callback) {

		var i, service, dependencyNames, dependencyCount, dependencies, hasDoneCallback, resolveCount;

		service = services[name];
		resolveChain.push(name);

		if (!service) {
			callback(new Error('No implementation registered for ' + name)); //done
			return;
		}

		service.resolvedCallbacks = service.resolvedCallbacks || [];
		service.resolvedCallbacks.push(function(err) {
			callback(err, service.obj);
		});

		if (service.isResolving) {
			return;
		}
		service.isResolving = true;

		if (service.hasOwnProperty('obj')) {
			_callResolvedCallbacks(null, service);
			return;
		}

		if (!service.klass && !service.factory) {
			_callResolvedCallbacks(new Error('No valid implementation registered for ' + name), service);
			return;
		}

		dependencyNames = _getArgumentNames(service.klass || service.factory);
		if (_hasCircularDependencies(dependencyNames, resolveChain)) {
			_callResolvedCallbacks(new Error('There are circular dependencies in resolve chain: ' + resolveChain), service);
			return;
		}

		dependencyCount = dependencyNames.length;
		if (dependencyCount === 0) {
			_createObject(service, []);
			_callResolvedCallbacks(null, service);
		}

		dependencies = [];
		hasDoneCallback = false;
		resolveCount = 0;
		for(i = 0; i < dependencyCount; i++) {

			(function(index) {

				var dependencyCallback = function (err, dependency) {
					if (err) {
						_callResolvedCallbacks(err, service);
						return;
					}
					dependencies[index] = dependency;
					resolveCount++;
					if (resolveCount === dependencyCount) {
						_createObject(service, dependencies);
						if (!hasDoneCallback) {
							_callResolvedCallbacks(null, service);
						}
					}
				};

				if (dependencyNames[index] === 'done') {
					hasDoneCallback = true;
					dependencyCallback(null, function(err) {
						_callResolvedCallbacks(err, service);
					});
					return;
				}

				_resolve(dependencyNames[index], services, resolveChain.slice(0), dependencyCallback);

			})(i);

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
			klass: klass
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
			factory: factory
		};
		return this;
	};

	Sandal.prototype.register = function(name, obj) {
		if (name === 'done' || this.services[name]) {
			throw new Error('There is already an implementation registered with the name ' + name);
		}
		this.services[name] = {
			obj: obj
		};
		return this;
	};

	Sandal.prototype.resolve = function(arg1, arg2) {

		var that, callback, serviceNames, serviceCount, resolvedCount, resolved, i;

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
			serviceNames = _getArgumentNames(callback);
			serviceNames = serviceNames.splice(1);
		}

		serviceCount = serviceNames.length;
        if (serviceCount === 0) {
            callback(null);
            return;
        }

		resolvedCount = 0;
		resolved = [];
		for (i = 0; i < serviceCount; i++) {
			(function (index) {
				_resolve(serviceNames[index], that.services, [], function(err, svc) {
					resolvedCount++;
					resolved[0] = resolved[0] || err;
					resolved[index + 1] = svc;
					if (resolvedCount === serviceCount) {
						callback.apply({}, resolved);
					}
				});
			})(i);
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
			if (names[i] === 'sandal' || names[i] === 'done') {
				throw new Error('Clearing sandal or done is not allowed');
			}
			delete this.services[names[i]];
		}
		return this;
	};

	return Sandal;

})();


if (typeof module === 'undefined' || typeof module.exports  === 'undefined') {
	this['Sandal'] = Sandal;
} else {
	module.exports = Sandal;
}
