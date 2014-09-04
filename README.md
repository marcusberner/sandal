# Sandal

[![Build Status](https://travis-ci.org/marcusberner/sandal.png?branch=master)](https://travis-ci.org/marcusberner/sandal)

[![browser support](https://ci.testling.com/marcusberner/sandal.png)](https://ci.testling.com/marcusberner/sandal)

[![NPM](https://nodei.co/npm/sandal.png?downloads=true)](https://nodei.co/npm/sandal/)

Sandal is a javascript dependency injection container. A sandal container can be used to register and resolve components. It will resolve dependencies and inject them.

## Installation

Download source from [GitHub](https://github.com/marcusberner/sandal) or install using npm or bower:

### Node package manager
    $ npm install sandal

### Bower
	$ bower install sandal


## API


### Create a container

#### Node.js
```js
var Sandal = require('sandal');
var sandal = new Sandal();
```


#### Browser
```js
var sandal = new Sandal();
```

### Register components


#### sandal.object(name, obj, [groups])


* `name` (string) The name that will be used to resolve the component. "sandal" and "done" are reserved names. 

* `obj` (any type) The object that will be provided when resolving.

* `groups` (Array of strings) Will add the object to the provided groups. "sandal" and "done" are reserved names.


##### Example
```js
sandal.object('myObject', 'any object', ['myGroup', 'myOtherGroup']);
```


#### sandal.service(name, [dependencies], ctor, [transient], [groups])


* `name` (string) The name that will be used to resolve the component. "sandal" and "done" are reserved names. 

* `dependencies` (Array of strings) If provided the names in the array will be resolved and injected into the ctor. Otherwise the names of the ctor arguments will be used.

* `ctor` (function) The service constructor. When resolving, the ctor will be called with the new operator and the result will be provided.

* `transient` (boolean) If true the ctor will be called every time the service is resolved, resulting an a new object. Default behavior is singleton where the ctor is only called the first time and the resulting object is provided every time.

* `groups` (Array of strings) Will add the service to the provided groups. "sandal" and "done" are reserved names.

If the constructor requires asynchronous tasks to be completed before the resulting object is ready to use, a done callback named `done` can be taken as a constructor argument. This will inject a callback that has to be called before the service is resolved. The done callback accepts an error. If an error is provided, that will result in an error when resolving the service or any factory or service dependent on the service.


##### Example


```js
var MyService = function (dependency1) {
    this.doStruff = function () {};
};
MyService.prototype.doOtherStuff = function () {};

var MyAsyncService = function (x, done) {
    doSomeAsyncInit(function (err) {
        done(err);
    });
};

sandal.service('myService', MyService, true, ['myGroup']);
sandal.service('myAsyncService', ['myService', 'done'], MyAsyncService);
```


#### sandal.factory(name, [dependencies], factory, [transient], [groups])


* `name` (string) The name that will be used to resolve the component. "sandal" and "done" are reserved names. 

* `dependencies` (Array of strings) If provided the names in the array will be resolved and injected into the factory. Otherwise the names of the factory arguments will be used.

* `factory` (function) The factory function. When resolving, the factory will be called and the return value will be provided. If one of the dependencies has the name "done", a done callback function will be injected. In that case the provided result will be the second argument to the done callback and not the return value of the factory function.

* `transient` (boolean) If true the factory will be called every time the it is resolved, resulting an a new object. Default behavior is singleton where the factory is only called the first time and the resulting object is provided every time.

* `groups` (Array of strings) Will add the factory to the provided groups. "sandal" and "done" are reserved names.

A factory that requires some asynchronous task to be completed should take a `done` callback just like a service. If a factory takes a done callback, the second argument of the done callback will be the resolved object instead of the return value of the factory function.


##### Example


```js
var myFactory = function (dependency1) {
    return 'some value';
};

var myAsyncFactory = function (d1, done) {
    d1.doSomeAsyncInit(function (err) {
        done(err, 'some value');
    });
};

sandal.factory('myFactory', myFactory, true, ['myGroup']);
sandal.factory('myAsyncFactory', ['dependency1', 'done'], myAsyncFactory);
```

### Resolving components


#### sandal.resolve([names], callback)


* `names` (string or Array of strings) If provided, the name/names will be resolved and injected into the callback. The first argument to the callback function will always be any error from resolving. If not provided the names of the callback arguments will be used. The names must match the names used for services, factories, objects or groups. Resolving a group will provide an object containing all components in the group. The component will be contained within a property with the same name as the registered name.

* `callback` (function) The dependencies will be resolved and injected to the callback function.


##### Example
```js
sandal.resolve(function (err, myObject, myService, myFactory, myGroup) {
});
sandal.resolve('myObject', function (err, o) {
});
sandal.resolve(['myObject', 'myService', 'myFactory', 'myGroup'], function (err, o, s, f, t) {
});
```

#### sandal.resolveAsFactory(factory, [dependencies], callback)

* `factory` (function) The factory function to resolve. The factory will not be added to the container but resolved as if it was added and then resolved.

* `dependencies` (Array of strings) If provided, the name/names will be resolved and injected into the factory.

* `callback` (function) The resolved factory will be passed to the callback as the second argument. It failing the error will be passed as a first argument.


##### Example
```js
sandal.object('myObject', { some: 'data' });
sandal.resolveAsFactory(function (myObject) {
	// Return output or pass to done() if available
}, function (err, output) {
	// output will be result of factory
});
```

#### sandal.resolveAsService(service, [dependencies], callback)

* `service` (function) The service constructor. The service will not be added to the container but resolved as if it was added and then resolved.

* `dependencies` (Array of strings) If provided, the name/names will be resolved and injected into the service constructor.

* `callback` (function) The resolved service will be passed to the callback as the second argument. It failing the error will be passed as a first argument.


##### Example
```js
sandal.object('myObject', { some: 'data' });
sandal.resolveAsService(function (myObject) {
	// Constructor code
}, function (err, output) {
	// output will be the constructed object
});
```


### Removing components


Registering a component with an already registered name will throw an error. To replace a component it must be removed before registering the new component.


#### sandal.remove(names)


* `names` (string or Array of strings) Name/names of objects, factories, services or groups to remove. Removing a group will remove the group but not the components in the group.


##### Example
```js
sandal.remove('myObject');
sandal.remove(['myObject', 'myService', 'myFactory', 'myGroup']);
```

#### sandal.clear()


Removes all registered components.


#### Example
```js
sandal.clear();
```

### Checking component

To check if a component has been registered, use the `.has(name)` function.

#### sandal.has(name)


* `name` (string) Name of object, factory, service or group to look for.

##### Example
```js
sandal.object('myObject', { some: 'data' });

sandal.has('myObject'); // Returns true
sandal.has('yourObject'); // Returns false
sandal.has('sandal'); // Returns true since the container is always available
```

### Extending

Both a container and the contstructor can be extended.

##### Example
```js
Sandal.extend(function (constructor, isConstructor) {
    // isConstructor = true
    constructor.prototype.someNewFunction = function () {};
});

var sandal = new Sandal();
sandal.extend(function (container, isConstructor) {
    // isConstructor = false
    container.someOtherNewFunction = function () {};
});
```

Expected behaviour is that, extending the constructor applies to all created containers and extending a container only applies to that container.

The same extension can be compatible with both extending the constructor and a container. The same container behaviour is exprected in both cases.

It's recommended to throw an error if the extension is not applicable to the constructor or container base on the `isConstructor` argument, indicating that it was used in a non supported way.

### Chaining


All sandal operations can be chained.


##### Example
```js
sandal.factory('myFactory', MyFactory).resolve(function (err, myFactory) {});
```