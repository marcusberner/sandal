'use strict';

var Sandal = (function () {

    var Sandal, _getArgumentNames, _register, _hasCircularDependencies, _callResolvedCallbacks, _createObjectSync, _resolve;

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

	_getArgumentNames = function (func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if (argumentList === null) {
			argumentList = [];
		}
		return argumentList;
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

	_resolve = function (name, container, resolveChain, callback) {

		var i, obj, resolvingDone, item, dependencyCount, dependencies, hasDoneCallback, resolvedDependenciesCount;

        resolveChain.push(name);

        item = container[name];

        if (!item) {
			callback(new Error('No implementation registered for ' + name + ((resolveChain.length < 2) ? '' : (' needed for ' + resolveChain.splice(resolveChain.length - 2, 1)))));
            return;
        }

		resolvingDone = function (err, obj) {
			if (item.lifecycle === 'singleton') {
				item.singleton = obj;
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

				_resolve(item.dependencyNames[index], container, resolveChain.slice(0), dependencyCallback);

			})(i);

		}

	};

	Sandal = function () {
		this.clear();
	};

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
		_register(this.container, name, {
			ctor: ctor,
			lifecycle: transient ? 'transient' : 'singleton',
			dependencyNames: dependencies
		}, groups);
		return this;
	};

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
		_register(this.container, name, {
			factory: factory,
			lifecycle: transient ? 'transient' : 'singleton',
			dependencyNames: dependencies
		}, groups);
		return this;
	};

	Sandal.prototype.object = function (name, obj, groups) {
		_register(this.container, name, {
			singleton: obj,
			lifecycle: 'singleton'
		}, groups);
		return this;
	};

	Sandal.prototype.resolve = function (arg1, arg2) {

		var that = this, callback, itemNames, itemCount, resolvedCount, resolved, i;

		if (typeof arg1 === 'string') {
            itemNames = [ arg1 ];
			callback = arg2;
		} else if (typeof arg1 === 'function') {
			callback = arg1;
		} else {
            itemNames = arg1;
			callback = arg2;
		}

		if (typeof callback !== 'function') {
			throw new Error('Callback function required');
		}

		if (!itemNames) {
            itemNames = _getArgumentNames(callback);
            itemNames = itemNames.splice(1, itemNames.length - 1);
		}
        itemCount = itemNames.length;
        if (itemCount === 0) {
            callback(null);
            return;
        }

		resolvedCount = 0;
		resolved = [];
		for (i = 0; i < itemCount; i++) {
			(function (index) {
				_resolve(itemNames[index], that.container, [], function (err, svc) {
					resolvedCount++;
					resolved[0] = resolved[0] || err;
					resolved[index + 1] = svc;
					if (resolvedCount === itemCount) {
						callback.apply({}, resolved);
					}
				});
			})(i);
		}
		return this;
	};

	Sandal.prototype.remove = function (names) {
		if (!names) {
			return this;
		}
		if (typeof names === 'string') {
			names = [ names ];
		}
		for (var i = 0; i < names.length; i++) {
			if (names[i] === 'sandal' || names[i] === 'done') {
				throw new Error('Removing ' + names[i] + ' is not allowed');
			}
			delete this.container[names[i]];
		}
		return this;
	};

	Sandal.prototype.clear = function () {
		this.container = {
			sandal: {
				singleton: this,
				lifecycle: 'singleton'
			}
		};
		return this;
	};

	return Sandal;

})();

if (module && module.exports) {
	module.exports = Sandal;
}