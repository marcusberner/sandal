var Sandal = (function () {

	// TO implement
	//
	// Groups: Adding group with components not in container?
	// ResolveAs: "resolve as" should not return strange name when failing
	// circular dependencies at register time
	// Check for existing when register
	// Not allow remove sandal or done
	// Promise support
	// Make single component verbose
	// Define dependencies in options

	// TO document and test
	//
	// Logging and verbose

	'use strict';

	var _getArgumentNames, _cloneArray, _register, _addToGroup, Sandal;

	_getArgumentNames = function (func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if (argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	_cloneArray = function (args) {
		var result = [];
		for (var i = 0; i < args.length; i++) {
			result[i] = args[i];
		}
		return result;
	};

	_register = function (sandal, name, component, options, resolveComponent) {
		if (sandal._container[name]) throw new Error('There is already a component with the name ' + name);
		if (typeof component !== 'function') throw new Error('Factory or service ' + name + ' is not a function');
		var dependencyNames, doneIndex, checkDependencies;
		options = options || {};
		dependencyNames = options.dependencies || _getArgumentNames(component);
		(checkDependencies = function (dependencies) {
			if (!dependencies) return;
			for (var i = 0; i < dependencies.length; i++) {
				if (dependencies[i] === name) throw new Error(name + ' has circular dependency');
				if (sandal._container[dependencies[i]]) checkDependencies(sandal._container[dependencies[i]]._dependencies)
			}
		})(dependencyNames);
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
			sandal.resolve(sandal._container[name]._dependencies, function (err) {
				if (err) return callback(err);
				var dependencies = _cloneArray(arguments).slice(1);
				try {
					resolveComponent(component, dependencies, doneIndex, resolvedCallback);
				} catch (err) {
					resolvedCallback(err);
				}
			});
		};
		sandal._container[name]._dependencies = dependencyNames;
		if (options.groups) {
			for (var i = 0; i < options.groups.length; i++) {
				_addToGroup(sandal, name, options.groups[i]);
			}
		}
	};

	_addToGroup = function (sandal, name, groupName) {
		if (!sandal._container[groupName]) {
			sandal._container[groupName] = function (callback) {
				var dependencyNames = _cloneArray(sandal._container[groupName]._dependencies);
				sandal.resolve(dependencyNames, function (err) {
					if (err) return callback(err);
					var i,
						dependencies = _cloneArray(arguments).slice(1),
						group = {};
					for(i = 0; i < dependencyNames.length; i++) {
						group[dependencyNames[i]] = dependencies[i];
					}
					callback(null, group);
				});
			};
			sandal._container[groupName]._dependencies = [ name ];
			sandal._container[groupName]._isGroup = true;
		} else if (sandal._container[groupName]._isGroup) {
			sandal._container[groupName]._dependencies.push(name);
		} else {
			throw new Error('There is already a non group component with the name ' + groupName);
		}
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

				if (failed) return;

				// Check container and internal container for component
				// Return promise if configured and no callback

				sandal._info('Resolving ' + name);

				var resolveSingle = sandal._container[name] ? sandal._container[name] : function (singeCallback) {
					if (!sandal._internal) {
						failed = true;
						return singeCallback(new Error('No component named ' + name + ' registered'));
					}
					sandal._internal.resolve(name, singeCallback);
				};

				resolveSingle(function (err, instance) {
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

	Sandal.prototype.object = function (name, obj, options) {
		var sandal = this;
		if (sandal._container[name]) throw new Error('There is already a component with the name ' + name);
		sandal._info('Register object ' + name);
		sandal._container[name] = function (callback) { callback(null, obj); };
		sandal._container[name]._dependencies = [];
		if (options && options.groups) {
			for (var i = 0; i < options.groups.length; i++) {
				_addToGroup(sandal, name, options.groups[i]);
			}
		}
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

	Sandal.prototype.resolveAsFactory = function (factory, options, callback) {
		if (!callback) {
			if (typeof options === 'function') {
				callback = options;
				options = {};
			}
			// Promises for no callback
		}
		options = options || {};
		var dependencies = options.dependencies || _getArgumentNames(factory);
		this.resolve(dependencies, function (err) {
			if (err) return callback(err);
			callback(null, factory.apply(undefined, _cloneArray(arguments).slice(1)));
		});
	};

	Sandal.prototype.resolveAsService = function (service, options, callback) {
		if (!callback) {
			if (typeof options === 'function') {
				callback = options;
				options = {};
			}
			// Promises for no callback
		}
		options = options || {};
		var dependencies = options.dependencies || _getArgumentNames(service);
		this.resolve(dependencies, function (err) {
			if (err) return callback(err);
			var O, result;
			O = function () {};
			O.prototype = service.prototype;
			result = new O();
			service.prototype.constructor.apply(result, _cloneArray(arguments).slice(1));
			callback(null, result);
		});
	};

	Sandal.prototype.remove = function (name) {
		if (name instanceof Array) {
			for (var i = 0; i < name.length; i++) {
				this.remove(name[i]);
			}
			return;
		}
		if (name === 'done') throw new Error('Removing done is not allowed');
		if (name === 'sandal') throw new Error('Removing sandal is not allowed');
		delete this._container[name];
		for (var groupName in this._container) {
			if (this._container[groupName]._isGroup) {
				var index = this._container[groupName]._dependencies.indexOf(name);
				if (index >= 0) {
					this._container[groupName]._dependencies.splice(index, 1);
				}
			}
		}
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