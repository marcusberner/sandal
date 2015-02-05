var Sandal=function(){/*
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
"use strict";var t=function(t){var n,e;return n=t.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,""),e=n.slice(n.indexOf("(")+1,n.indexOf(")")).match(/([^\s,]+)/g),null===e&&(e=[]),e},n=function(n,e,i,o){var o=o||{},r=this,c=function(t){var e,o,c=!1,s=this.dependencies.length,u=0,a=[],p=function(){if(!(s>u))try{var e;"factory"===n?o=i.apply(void 0,a):(e=function(){},e.prototype=i.prototype,o=new e,i.prototype.constructor.apply(o,a)),c||t(null,o)}catch(r){t(r)}};for(p(),e=0;e<this.dependencies.length;e++)!function(e,i){return"done"===i?(c=!0,u++,a[e]=function(e,i){setTimeout(function(){t(e,"factory"===n?i:o)},0)},void p()):void r.resolve(i,function(n,i){return n?t(n):(u++,a[e]=i,void p())})}(e,this.dependencies[e])};return c.dependencies=o.dependencies||t(i),this._container[e]=c.bind(c),this},e=function(t){this._options=t||{},this.clear()};return e.prototype.has=function(t){return!!this._container[t]},e.prototype.resolve=function(n,e){e||(e=n,n=t(e).slice(1)),"string"==typeof n&&(n=[n]);var i,o=n.length,r=0,c=[];for(i=0;o>i;i++)(function(t,n){r++,c[t]=this._container[n]}).bind(this)(i,n[i]);this._container[n]?this._container[n](e):this._internal?this._internal.resolve(n,e):e(new Error('No implementation registered for "'+n+'"'))},e.prototype.internal=function(t){return this._internal=t,this},e.prototype.object=function(t,n){return this._container[t]=function(t){t(null,n)},this},e.prototype.factory=function(t,e,i){return n.bind(this)("factory",t,e,i)},e.prototype.service=function(t,e,i){return n.bind(this)("service",t,e,i)},e.prototype.clear=function(){return this._container={sandal:function(t){t(null,this)}.bind(this)},this},e}();module&&module.exports&&(module.exports=Sandal);
//# sourceMappingURL=sandal-min.map