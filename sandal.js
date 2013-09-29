'use strict';

var Sandal = (function () {

    var Sandal, _getArgumentNames, _hasCircularDependencies, _callResolvedCallbacks, _createObject, _resolve;

	_getArgumentNames = function(func) {
		var functionString, argumentList;
		functionString = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		argumentList = functionString.slice(functionString.indexOf('(')+1, functionString.indexOf(')')).match(/([^\s,]+)/g);
		if(argumentList === null) {
			argumentList = [];
		}
		return argumentList;
	};

	_hasCircularDependencies = function (dependencyNames, resolveChain) {
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

	_callResolvedCallbacks = function (err, item) {
		for (var i = 0; i < item.resolvedCallbacks.length; i++) {
            item.resolvedCallbacks[i](err);
		}
        item.resolvedCallbacks = [];
        item.isResolving = false;
	};

    _createObject = function (item, dependencies) {
        if (item.ctor) {
            var obj = Object.create(item.ctor.prototype);
            item.ctor.prototype.constructor.apply(obj, dependencies);
            return obj;
        } else {
            return item.factory.apply(null, dependencies);
        }
    };

	_resolve = function(name, itmes, resolveChain, callback) {

		var i, obj, done, isDone, item, dependencyNames, dependencyCount, dependencies, hasDoneCallback, resolveCount;

        resolveChain.push(name);

        item = itmes[name];

        if (!itmes[name]) {
            callback(new Error('No implementation registered for ' + name));
            return;
        }

        done = function (err, obj) {
            if (!isDone) {
                isDone = true;
                if (item.lifecycle === 'singleton') {
                    item.singleton = obj;
                    _callResolvedCallbacks(err, item);
                } else {
                    callback(err, obj);

                }
            }
        };


        if (item.lifecycle === 'singleton') {

            item.resolvedCallbacks = item.resolvedCallbacks || [];
            item.resolvedCallbacks.push(function(err) {
                callback(err, item.singleton);
            });

            if (item.isResolving) {
                return;
            }
            item.isResolving = true;

            if (item.hasOwnProperty('singleton')) {
                done(null, item.singleton);
                return;
            }

        }

		if (!item.ctor && !item.factory) {
            done(new Error('No valid implementation registered for ' + name));
			return;
		}

		dependencyNames = _getArgumentNames(item.ctor || item.factory);
		if (_hasCircularDependencies(dependencyNames, resolveChain)) {
            done(new Error('There are circular dependencies in resolve chain: ' + resolveChain));
            return;
		}

		dependencyCount = dependencyNames.length;
		if (dependencyCount === 0) {
            try {
                obj = _createObject(item, []);
                done(null, obj);
            } catch (err) {
                done(err);
            }
		}

		dependencies = [];
		hasDoneCallback = false;
		resolveCount = 0;
		for(i = 0; i < dependencyCount; i++) {

			(function(index) {

				var dependencyCallback = function (err, dependency) {

                    if (err) {
						done(err);
						return;
					}
					dependencies[index] = dependency;
					resolveCount++;

					if (resolveCount === dependencyCount) {

                        try {
                            obj = _createObject(item, dependencies);
                        } catch (err) {
                            done(err);
                        }

						if (!hasDoneCallback) {
							done(null, obj);
						}
					}
				};


                if (dependencyNames[index] === 'done') {
                    hasDoneCallback = true;
                    dependencyCallback(null, function(err) {
                        done(err, obj);
                    });
                    return;
                }

				_resolve(dependencyNames[index], itmes, resolveChain.slice(0), dependencyCallback);

			})(i);

		}

	};

	Sandal = function() {
		this.clear();
	};

	Sandal.prototype.registerService = function(name, ctor, transient) {
		if (typeof ctor !== 'function') {
			throw new Error('Service must be a function');
		}
		if (name === 'done' || this.itmes[name]) {
			throw new Error('There is already an implementation registered with the name ' + name);
		}
		this.itmes[name] = {
            ctor: ctor,
            lifecycle: transient ? 'transient' : 'singleton'
		};
		return this;
	};

	Sandal.prototype.registerFactory = function(name, factory, transient) {
		if (typeof factory !== 'function') {
			throw new Error('Function required');
		}
		if (name === 'done' || this.itmes[name]) {
			throw new Error('There is already an implementation registered with the name ' + name);
		}
		this.itmes[name] = {
			factory: factory,
            lifecycle: transient ? 'transient' : 'singleton'
		};
		return this;
	};

	Sandal.prototype.register = function(name, obj) {
		if (name === 'done' || this.itmes[name]) {
			throw new Error('There is already an implementation registered with the name ' + name);
		}
		this.itmes[name] = {
            singleton: obj,
            lifecycle: 'singleton'
		};
		return this;
	};

	Sandal.prototype.resolve = function(arg1, arg2) {

		var that, callback, itemNames, itemCount, resolvedCount, resolved, i;

		that = this;
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
            itemNames = itemNames.splice(1);
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
				_resolve(itemNames[index], that.itmes, [], function(err, svc) {
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

	Sandal.prototype.clear = function(names) {

		if (!names) {
			this.itmes = {
				sandal: {
                    singleton: this,
                    lifecycle: 'singleton'
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
			delete this.itmes[names[i]];
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
