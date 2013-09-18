# Sandal

[![Build Status](https://travis-ci.org/marcusberner/sandal.png?branch=master)](https://travis-ci.org/marcusberner/sandal)

Sandal is a javascript inversion of control container compatible with both node.js browsers.

## Installation

    $ npm install sandal

## Usage

```js
// For use in browsers, including sandal.js will create a global Sandal constructor
var Sandal = require('sandal');

var sandal = new Sandal();

sandal
    .registerService('module1', function (module2, module3) {})
    .registerService('module2', function (module4, module5, done) {
        setTimeout(function() { done(); }, 500);
    })
    .register('module3', 'any object')
    .registerService('module4', function () {});
    .registerFactory('module5', function(module3) {
        return 'another object';
    })
    .resolve(function(error, module1) {
        // Resolves module1 and all dependencies
    });
```

### Register

There are three ways you can register a module:

```js
sandal.register(name, implementation);
sandal.registerService(name, constructor);
sandal.registerFactory(name, factory);
```

Resolving an implementation registered with `register` will return the same instance that was registered. Resolving multiple times will always return teh same instance.
Any type of object can be registered except `undefined`.
Registering a constructor requires a `function`. When resolving the constructor will be called the first time. The resulting object will be returned and resolving multiple times will return the same instance without calling the constructor again.
If the constructor takes arguments they will be automatically resolved based on argument name and injected before the constructor is called.
Registering a factory requires a `function`. When resolving the factory function will be called the first time. Similar to registering services, the factory function will only be called once and arguments automatically resolved based on argument name before the factory is called.

There are three reserved words that can not be used as names:
* `sandal` will inject the ioc container
* `done` will inject a done callback

### Resolve

Resolving an implementation can be done in the following ways:

```js
sandal.resolve(callback);
sandal.resolve(name, callback);
sandal.resolve(nameArray, callback);
```

The first argument of the callback will be any error from resolving.
Resolving with only a callback will user the argument names of the callback function.
Resolving with a name will resolve based on the provided name and inject into the callback.
Resolving with an array of names will resolve based on the provided names and inject into the callback in the same order.

### Clear

Registering with a name that is already registered will throw an error. To replace an implementation you first need to clear the current one. It is possible to clear all, one or a set of modules:

```js
sandal.clear(); // Clear all modules
sandal.clear(name); // Clear the named module
sandal.clear(nameArray);  // Clear the named modules
```

### Asynchronous constructor

If a constructor has some asynchronous tasks that needs to be done before the instance can be used, it should take an argument named `done`.
That will inject a `done` callback to the constructor. Calling the done callback with an error will pass the error to the resolve callback.
Resolving a module with dependencies to an asynchronous constructor will wait for all dependencies to be done before calling the module constructor.
