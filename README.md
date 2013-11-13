# Sandal

Sandal is a javascript inversion of control container

[![Build Status](https://travis-ci.org/marcusberner/sandal.png?branch=master)](https://travis-ci.org/marcusberner/sandal)

[![NPM](https://nodei.co/npm/sandal.png?downloads=true)](https://nodei.co/npm/sandal/)

## Installation

    $ npm install sandal

## Usage

A sandal container can be used to register and resolve objects.

### Create a container

```js
var Sandal = require('sandal');
var sandal = new Sandal();
```

### Register object

Resolving an item registered with `.object()` will always return the same object that was registered.

The name of an object, service or factory can not be `sandal` or `done`, since resolving sandal will return the container and done is reserved for the done callback for services and factories.

Registering is a synchronous operation and will throw an error if failing.

```js
sandal.object('myObject', 'any object');
```

### Register service

Resolving a service registered with `.service()` will call the registered object as a constructor and return the resulting object. The arguments to the constructor will be resolved based on name before the constructor is called and injected. Thus all arguments must be registered.

A service has a singleton behaviour by default, meaning that the constructor will only be called once and the same resulting object will be resolved every time. By providing a transient flag as a third argument the constructor will be called every time the service is resolved.

If the constructor requires some asynchronous tasks to be completed before the resulting object is ready to use, a done callback named `done` can be taken as a constructor argument. This will inject a callback that has to be called before the service is resolved. The done callback accepts an error. If an error is provided, that will result in an error when resolving the service or any factory or service dependent on the service.

```js
var MyService = function (dependency1) {
};
MyService.prototype.doStuff = function () {};

var MyAsyncService = function (dependency1, done) {
    dependency1.doSomeAsyncInit(done);
};

var MyTransientService = function (dependency1, done) {
    dependency1.doSomeAsyncInit(done);
};

sandal.service('myService', MyService);
sandal.service('myAsyncService', MyAsyncService);
sandal.service('myTransientService', MyTransientService, true);
```

### Register factory

Resolving a factory registered with `.factory()` will return the value returned by the factory function. Just like a service the default behaviour is singleton but can be made transient by providing the transient flag.

A factory that requires some asynchronous task to be completed should take a `done` callback just like a service. If a factory takes a done callback, the second argument of the done callback will be the resolved object instead of the return value of the factory function.

```js
var MyFactory = function (dependency1) {
    return 'some value';
};

var MyAsyncFactory = function (dependency1, done) {
    dependency1.doSomeAsyncInit(function (err) {
        done(err, 'some value');
    });
};

var MyTransientFactory = function (dependency1) {
    return 'some value';
};

sandal.factory('myFactory', MyFactory);
sandal.factory('myAsyncFactory', MyAsyncFactory);
sandal.factory('myTransientFactory', MyTransientFactory, true);
```

### Resolve

Resolving can be done by providing a function to `.resolve()`. The first argument of the function will be any error from resolving. The names or the arguments following the error will be matched to the registered names and the function will be called when all requested objects are resolved.

The name/names or the objects to resolve can also be provided as strings. This will inject them into the provided function in the same order they were specified following the error. When the names are provided as strings the argument names of the callback doesn't matter.

Resolving a service or factory will always resolve all dependencies recursively.

Resolving is an asynchronous operation if any of the resolved dependencies are asynchronous.

```js
sandal.resolve(function (err, myObject, myService, myFactory) {
});

sandal.resolve('myObject', function (err, o) {
});

sandal.resolve(['myObject', 'myService', 'myFactory'], function (err, o, s, f) {
});
```

### Remove

Trying to register using a name that is already registered will result in throw an error. To replace a registered component it has to be removed first.

Clearing all registered objects can be done by calling `.clear()`.

Removing one or a set of objects can be done by providing the names to `.remove()`.

Clearing and removing are synchronous operations.

```js
sandal.clear();
sandal.remove('myObject');
sandal.remove(['myObject', 'myService', 'myFactory']);
```

### Chaining

All sandal operations can be chained.

```js
sandal.factory('myFactory', MyFactory).resolve(function (err, myFactory) {
});
```