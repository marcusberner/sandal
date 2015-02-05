var Sandal = (function () {



/*
	_register = function (container, name, item, groups) {
		if (name === 'done' || container[name]) {
			throw new Error(name + ' is already registered');
		}
		if (groups) {
			for (var i = 0; i < groups.length; i++) {
				(function (i) {
					if (groups[i] === 'done' || (container[groups[i]] && !container[groups[i]].isGroup)) {
						throw new Error(name + ' is already registered and can not be used as group name');
					}
					if (container[groups[i]] && container[groups[i]].isGroup) {
						container[groups[i]].dependencyNames.push(name);
					} else {
						container[groups[i]] = {
							factory: function () {
								var result = {};
								for (var j = 0; j < container[groups[i]].dependencyNames.length; j++) {
									result[container[groups[i]].dependencyNames[j]] = arguments[j];
								}
								return result;
							},
							lifecycle: 'transient',
							dependencyNames: [name],
							isGroup: true
						}
					}
				})(i);
			}
		}
		container[name] = item;
	};

	_hasCircularDependencies = function (dependencyNames, resolveChain) {
		var i, j;
		for (j = 0; j < dependencyNames.length; j++) {
			for (i = 0; i < resolveChain.length; i++) {
				if (resolveChain[i] === dependencyNames[j]) {
					return true;
				}
			}
		}
		return false;
	};

	_callResolvedCallbacks = function (err, item) {
		for (var i = 0; i < item.resolvedCallbacks.length; i++) {
            item.resolvedCallbacks[i](err);
		}
        item.resolvedCallbacks = [];
        item.isResolving = false;
	};

    _createObjectSync = function (item, dependencies) {
        if (item.ctor) {
			var obj, O = function () {};
			O.prototype = item.ctor.prototype;
			obj = new O();
            item.ctor.prototype.constructor.apply(obj, dependencies);
            return obj;
        } else {
            return item.factory.apply(null, dependencies);
        }
    };

	_resolve = function (name, sandal, resolveChain, callback) {

		var i, obj, resolvingDone, item, dependencyCount, dependencies, hasDoneCallback, resolvedDependenciesCount;

        resolveChain.push(name);

        item = sandal._container[name];

		if (!item && sandal._internal && sandal._internal.has(name)) {
			sandal._internal.resolve(name, callback);
			return;
		}

        if (!item) {
			callback(new Error('No implementation registered for ' + name + ((resolveChain.length < 2) ? '' : (' needed for ' + resolveChain.splice(resolveChain.length - 2, 1)))));
            return;
        }

		resolvingDone = function (err, obj) {
			if (item.lifecycle === 'singleton') {
				if (!err) item.singleton = obj;
				_callResolvedCallbacks(err, item);
			} else {
				callback(err, obj);
			}
        };

        if (item.lifecycle === 'singleton') {

            item.resolvedCallbacks = item.resolvedCallbacks || [];
            item.resolvedCallbacks.push(function (err) {
                callback(err, item.singleton);
            });

            if (item.isResolving) {
                return;
            }
            item.isResolving = true;

            if (item.hasOwnProperty('singleton')) {
				resolvingDone(null, item.singleton);
                return;
            }

        }

		if (!item.ctor && !item.factory) {
			resolvingDone(new Error('No valid implementation registered for ' + name));
			return;
		}

		item.dependencyNames = item.dependencyNames || _getArgumentNames(item.ctor || item.factory);
		if (_hasCircularDependencies(item.dependencyNames, resolveChain)) {
			resolvingDone(new Error('There are circular dependencies in resolve chain: ' + resolveChain));
            return;
		}

		dependencyCount = item.dependencyNames.length;
		if (dependencyCount === 0) {
            try {
                obj = _createObjectSync(item, []);
				resolvingDone(null, obj);
            } catch (err) {
				resolvingDone(err);
            }
			return;
		}

		dependencies = [];
		hasDoneCallback = false;
		resolvedDependenciesCount = 0;
		for (i = 0; i < dependencyCount; i++) {

			(function (index) {

				var dependencyCallback = function (err, dependency) {

                    if (err) {
						resolvingDone(err);
						return;
					}
					dependencies[index] = dependency;
					resolvedDependenciesCount++;

					if (resolvedDependenciesCount === dependencyCount) {

                        try {
                            obj = _createObjectSync(item, dependencies);
                        } catch (err) {
							resolvingDone(err);
                        }

						if (!hasDoneCallback) {
							resolvingDone(null, obj);
						}
					}
				};

                if (item.dependencyNames[index] === 'done') {
                    hasDoneCallback = true;
					if (item.factory) {
						dependencyCallback(null, resolvingDone);
					} else {
						dependencyCallback(null, function (err) {
							setTimeout(function () {
								resolvingDone(err, obj);
							}, 0);
						});
					}
                    return;
                }

				_resolve(item.dependencyNames[index], sandal, resolveChain.slice(0), dependencyCallback);

			})(i);

		}

	};

	_resolveAs = function(s, type, component, dependencies, callback) {
		if (!callback) {
			callback = dependencies;
			dependencies = null;
		}
		var name, prefix = '$_tmp_', suffix = 0;
		do {
			name = prefix + (suffix++);
		} while (s.has(name));
		if (dependencies) s[type](name, dependencies, component);
		else s[type](name, component);
		s.resolve(name, callback);
		s.remove(name);
	};
*/




	/*
	Sandal.prototype.service = function (name, dependencies, ctor, transient, groups) {
		if (!(dependencies instanceof Array)) {
			groups = transient;
			transient = ctor;
			ctor = dependencies;
			dependencies = null;
		}
		if (transient instanceof Array) {
			groups = transient;
			transient = false;
		}
		if (typeof ctor !== 'function') {
			throw new Error('Service "' + name + '" must be a function');
		}
		_register(this._container, name, {
			ctor: ctor,
			lifecycle: transient ? 'transient' : 'singleton',
			dependencyNames: dependencies
		}, groups);
		return this;
	};
	*/

	/*
	Sandal.prototype.factory = function (name, dependencies, factory, transient, groups) {
		if (!(dependencies instanceof Array)) {
			groups = transient;
			transient = factory;
			factory = dependencies;
			dependencies = null;
		}
		if (transient instanceof Array) {
			groups = transient;
			transient = false;
		}
		if (typeof factory !== 'function') {
			throw new Error('Factory "' + name + '" must be a function');
		}
		_register(this._container, name, {
			factory: factory,
			lifecycle: transient ? 'transient' : 'singleton',
			dependencyNames: dependencies
		}, groups);
		return this;
	};
	*/

	/*
	Sandal.prototype.object = function (name, obj, groups) {
		_register(this._container, name, {
			singleton: obj,
			lifecycle: 'singleton'
		}, groups);
		return this;
	};
	*/

	/*
	Sandal.prototype.internal = function (container) {
		this._internal = container;
		return this;
	};
	*/

	/*
	Sandal.prototype.resolve = function (dependencyNames, callback) {

		var that = this, itemCount, resolvedCount, resolved, i;

		if (typeof dependencyNames === 'string') {
            dependencyNames = [ dependencyNames ];
		} else if (typeof dependencyNames === 'function') {
			callback = dependencyNames;
			dependencyNames = _getArgumentNames(callback);
			dependencyNames = dependencyNames.splice(1, dependencyNames.length - 1);
		}

		if (!(dependencyNames instanceof Array) && typeof callback !== 'function') return;

        itemCount = dependencyNames.length;
        if (itemCount === 0) return callback();

		resolvedCount = 0;
		resolved = [];
		for (i = 0; i < itemCount; i++) {
			(function (index) {
				_resolve(dependencyNames[index], that, [], function (err, svc) {
					resolvedCount++;
					resolved[0] = resolved[0] || err;
					resolved[index + 1] = svc;
					if (resolvedCount === itemCount) {
						if (callback) callback.apply({}, resolved);
					}
				});
			})(i);
		}
	};
	*/

	/*
	Sandal.prototype.resolveAsFactory = function (factory, dependencies, callback) {
		_resolveAs(this, 'factory', factory, dependencies, callback);
	};
	*/

	/*
	Sandal.prototype.resolveAsService = function (service, dependencies, callback) {
		_resolveAs(this, 'service', service, dependencies, callback);
	};
	*/

	/*
	Sandal.prototype.remove = function (names) {
		var i, j, key;
		if (!names) {
			return this;
		}
		if (typeof names === 'string') {
			names = [ names ];
		}
		for (i = 0; i < names.length; i++) {
			if (names[i] === 'sandal' || names[i] === 'done') {
				throw new Error('Removing ' + names[i] + ' is not allowed');
			}
			delete this._container[names[i]];
			for (key in this._container) {
				if (this._container[key].isGroup) {
					for (j in this._container[key].dependencyNames) {
						if (this._container[key].dependencyNames[j] === names[i]) {
							this._container[key].dependencyNames.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		return this;
	};
	*/



	// TO implement
	//
	// Groups: group without members in container?
	// ResolveAs: "resolve as" not returning strange name when failing
	// singleton and transient
	// circular dependencies at register time
	// Parallel resolving of singleton factories and services
	// Wait for done
	// Check for existing when register
	// Not allow remove sandal or done
	// Promise support


	'use strict';

	var _getArgumentNames = function (func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if (argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	var _registerFactoryOrService = function(type, name, factoryOrService, options) {
		// singleton handling
		var options = options || {},
			sandal = this,
			resolve = function (callback) {

				var isAsync = false,
					dependencyCount = this.dependencies.length,
					resolvedDependencyCount = 0,
					resolvedDependencies = [],
					i,
					result,
					applyIfDependenciesResolved = function () {
						if (dependencyCount > resolvedDependencyCount) return;
						try {
							var obj, O;
							if (type === 'factory') result = factoryOrService.apply(undefined, resolvedDependencies);
							else {
								O = function () {};
								O.prototype = factoryOrService.prototype;
								result = new O();
								factoryOrService.prototype.constructor.apply(result, resolvedDependencies);
							}
							// don't call if done
							if (!isAsync) callback(null, result);
						} catch (err) {
							// don't call if done
							callback(err);
						}
					};

				applyIfDependenciesResolved();
				for (i = 0; i < this.dependencies.length; i++) {
					(function (index, name) {
						if (name === 'done') {
							// Check for multiple done
							isAsync = true;
							resolvedDependencyCount++;
							resolvedDependencies[index] = function (err, obj) {
								setTimeout(function () {
									callback(err, type === 'factory' ? obj : result);
								}, 0);
							};
							applyIfDependenciesResolved();
							return;
							// Add done to dep and replace resolved
						}
						sandal.resolve(name, function (err, dependency) {
							if (err) return callback(err);
							resolvedDependencyCount++;
							resolvedDependencies[index] = dependency;
							applyIfDependenciesResolved();
						});
					})(i, this.dependencies[i]);
				}
			};
		resolve.dependencies = options.dependencies || _getArgumentNames(factoryOrService);
		this._container[name] = resolve.bind(resolve);
		return this;
	};

	var Sandal = function (options) {
		this._options = options || {};
		this.clear();
	};

	Sandal.prototype.has = function (name) {
		return !!this._container[name];
	};

	Sandal.prototype.resolve = function (dependencyNames, callback) {
		if (!callback) {
			callback = dependencyNames;
			dependencyNames = _getArgumentNames(callback).slice(1);
		}
		if (typeof dependencyNames === 'string') dependencyNames = [ dependencyNames ];

		var totalCount = dependencyNames.length,
			resolveCount = 0,
			dependencies = [],
			i;

		for (i = 0; i < totalCount; i++) {
			(function (index, name) {
				resolveCount++;
				dependencies[index] = this._container[name]
			}.bind(this))(i, dependencyNames[i]);
		}


		if (this._container[dependencyNames]) this._container[dependencyNames](callback);
		else if (this._internal) this._internal.resolve(dependencyNames, callback);
		else callback(new Error('No implementation registered for "' + dependencyNames + '"'));
	};

	Sandal.prototype.internal = function (sandal) {
		this._internal = sandal;
		return this;
	};

	Sandal.prototype.object = function (name, obj) {
		this._container[name] = function (callback) { callback(null, obj); };
		return this;
	};

	Sandal.prototype.factory = function (name, factory, options) {
		return _registerFactoryOrService.bind(this)('factory', name, factory, options);
	};

	Sandal.prototype.service = function (name, ctor, options) {
		return _registerFactoryOrService.bind(this)('service', name, ctor, options);
	};

	Sandal.prototype.clear = function () {
		this._container = {
			sandal: function (callback) { callback(null, this); }.bind(this)
		};
		return this;
	};

	return Sandal;

})();

if (module && module.exports) {
	module.exports = Sandal;
}