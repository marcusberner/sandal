var Sandal = (function () {

	// TO implement
	//
	// Groups: Adding group without members to container?
	// ResolveAs: "resolve as" should not return strange name when failing
	// circular dependencies at register time
	// Check for existing when register
	// Not allow remove sandal or done
	// Promise support
	// Make single component verbose

	// TO document and test
	//
	// Logging and verbose

	'use strict';

	var _getArgumentNames, _toArray, _register, Sandal;

	_getArgumentNames = function (func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if (argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	_toArray = function (args) {
		var result = [];
		for (var i = 0; i < args.length; i++) {
			result[i] = args[i];
		}
		return result;
	};

	_register = function (sandal, name, component, options, resolveComponent) {
		var dependencyNames, doneIndex;
		options = options || {};
		dependencyNames = _getArgumentNames(component);
		doneIndex = dependencyNames.indexOf('done');
		sandal._container[name] = function (callback) {
			var resolvedCallback = callback;
			if (!options.lifecycle || options.lifecycle === 'singleton') {
				if (sandal._container[name]._error) {
					sandal._error('Singleton ' + name + ' previously failed ');
					callback(sandal._container[name]._error);
					return;
				}
				if (sandal._container[name].hasOwnProperty('_instance')) {
					sandal._info('Returning already resolved singleton ' + name);
					callback(null, sandal._container[name]._instance);
					return
				}
				if (sandal._container[name]._resolvedCallbacks) {
					sandal._info('Resolving of the singleton ' + name + ' is in progress, waiting for completion');
					sandal._container[name]._resolvedCallbacks.push(callback);
					return;
				}
				sandal._container[name]._resolvedCallbacks = [ callback ];
				resolvedCallback = function (err, instance) {
					sandal._info('Resolving of ' + name + ' done ' + (err ? 'with' : 'without') + ' error');
					sandal._container[name]._error = err;
					sandal._container[name]._instance = instance;
					sandal._info('Returning ' + name + ' to ' + sandal._container[name]._resolvedCallbacks.length + ' queued callbacks');
					for (var i = 0; i < sandal._container[name]._resolvedCallbacks.length; i++) {
						sandal._container[name]._resolvedCallbacks[i](err, instance);
					}
					sandal._container[name]._resolvedCallbacks = [];
				};
			}
			sandal._info('Resolving ' + name + ' dependencies: ' + dependencyNames);
			sandal.resolve(dependencyNames, function (err) {
				var dependencies = _toArray(arguments).slice(1);
				if (err) return callback(err);
				try {
					resolveComponent(component, dependencies, doneIndex, resolvedCallback);
				} catch (err) {
					resolvedCallback(err);
				}
			});
		};
	};

	Sandal = function (options) {
		options = options || {};
		var sandal = this,
			c = options.console || console;
		sandal._options = options;
		sandal.name = options.name || 'Container ' + Math.round(Math.random() * 100000);
		sandal._info = function (message) {
				if (options.verbose && c && c.info) {
					c.info(sandal.name + ': ' + message);
				}
			};
		sandal._error = function (message) {
				if (options.verbose && c && c.error) {
					c.error(sandal.name + ': ' + message);
				}
			};
		sandal.clear();
	};

	Sandal.prototype.has = function (name) {
		return !!this._container[name];
	};

	Sandal.prototype.resolve = function () {
		var sandal = this,
			dependencyNames,
			callback,
			totalCount,
			failed = false,
			resolveCount = 0,
			dependencies = [],
			i;
		if (typeof arguments[0] === 'string') {
			dependencyNames = [arguments[0]];
			callback = arguments[1];
		} else if (arguments[0] instanceof Array) {
			dependencyNames = arguments[0];
			callback = arguments[1];
		} else if (typeof arguments[0] === 'function') {
			dependencyNames = _getArgumentNames(arguments[0]).slice(1);
			callback = arguments[0];
		} else {
			return;
		}
		sandal._info('Initiating resolving of ' + dependencyNames);
		totalCount = dependencyNames.length;
		if (totalCount === 0) {
			return callback(null, []);
		}
		for (i = 0; i < totalCount; i++) {
			(function (index, name) {

				// Check container and internal container for component

				sandal._info('Resolving ' + name);
				sandal._container[name](function (err, instance) {
					if (err) {
						failed = true;
						sandal._error('Failed resolving ' + name + ': ' + err.message);
						return callback(err);
					}
					if (failed) return;
					resolveCount++;
					dependencies[index] = instance;
					if (resolveCount === totalCount) {
						sandal._info('Done resolving ' + dependencyNames);
						callback.apply(undefined, [err].concat(dependencies));
					}
				});
			})(i, dependencyNames[i]);
		}
	};

	Sandal.prototype.internal = function (sandal) {
		this._info('Setting internal container to ' + sandal.name);
		this._internal = sandal;
		return this;
	};

	Sandal.prototype.object = function (name, obj) {
		this._info('Register object ' + name);
		this._container[name] = function (callback) { callback(null, obj); };
		return this;
	};

	Sandal.prototype.factory = function (name, component, options) {
		var sandal = this;
		sandal._info('Register factory ' + name);
		_register(this, name, component, options, function (component, dependencies, doneIndex, callback) {
			sandal._info('Applying factory ' + name);
			if (doneIndex >= 0) {
				dependencies[doneIndex] = callback;
				component.apply(undefined, dependencies);
			} else {
				callback(null, component.apply(undefined, dependencies));
			}
		});
		return this;
	};

	Sandal.prototype.service = function (name, component, options) {
		var sandal = this;
		sandal._info('Register service ' + name);
		_register(this, name, component, options, function (component, dependencies, doneIndex, callback) {
			sandal._info('Creating service ' + name);
			var O, result;
			O = function () {};
			O.prototype = component.prototype;
			result = new O();
			if (doneIndex >= 0) {
				dependencies[doneIndex] = function (err) {
					if (err) return callback(err);
					callback(null, result);
				};
				component.prototype.constructor.apply(result, dependencies);
			} else {
				component.prototype.constructor.apply(result, dependencies);
				callback(null, result);
			}
		});
		return this;
	};

	Sandal.prototype.clear = function () {
		this._info('Clearing container');
		var sandal = this;
		this._container = {
			sandal: function (callback) { callback(null, sandal); },
			done: function (callback) { callback(null, null); }
		};
		return sandal;
	};

	return Sandal;

})();

if (module && module.exports) {
	module.exports = Sandal;
}