# Sandal

Sandal is a javascript inversion of control container

[![Build Status](https://travis-ci.org/marcusberner/sandal.png?branch=master)](https://travis-ci.org/marcusberner/sandal)

[![NPM](https://nodei.co/npm/sandal.png?downloads=true)](https://nodei.co/npm/sandal/)

## Installation

    $ npm install sandal

## Usage

```js
var Sandal = require('sandal');

var sandal = new Sandal();

sandal
    .service('service1', function (service2, factory1, object1) {})
    .service('service2', function (done) {
        setTimeout(function() { done(); }, 500);
    })
    .object('object1', 'any object')
    .factory('factory1', function(object1) {
        return 'another object';
    }, true) // Setting transient lifecycle
    .resolve(function(error, service1) {
        // Resolves service1 and all dependencies
    })
```

### Register

There are three ways you can register:

```js
sandal.object(name, implementation);
sandal.service(name, constructor, transient);
sandal.factory(name, factory, transient);
```

A module registered with `register` will always have a singleton lifecycle. Resolving will always return the same instance.

A module registered with `registerFactory` must be a function. The return value of the function will be the resolved value. The default lifecycle is singleton meaning that the function is only evaluated once. By setting `transient` to `true` the function will be evaluated every time.

A module registered with `registerService` must be a function. The function will be called as a constructor with the new keyword. The default lifecycle is singleton meaning that the constructor is only evaluated once. By setting `transient` to `true` the constructor will be evaluated every time.

Note that the service or factory is evaluated when resolved and not when registered.

There are two reserved words that can not be used as names:
* `sandal` will inject the ioc container
* `done` will inject a done callback

### Resolve

Resolving can be done in the following ways:

```js
sandal.resolve(callback);
sandal.resolve(name, callback);
sandal.resolve([names], callback);
```

The first argument of the callback will be any error from resolving.

Resolving with only a callback will user the argument names of the callback function.

Resolving with a name will resolve based on the provided name and inject into the callback.

Resolving with an array of names will resolve based on the provided names and inject into the callback in the same order.

### Clear

Registering with a name that is already registered will throw an error. To replace an implementation you first need to clear the current one. It is possible to clear all, one or a set of modules:

```js
sandal.clear(); // Clear all modules
sandal.clear(name);
sandal.clear([names]);
```

### Asynchronous service or factory

If a service or factory has some asynchronous tasks that needs to be done before the instance can be used, it should take an argument named `done`.

That will inject a `done` callback to the constructor. Calling the done callback with an error will pass the error to the resolve callback.

Resolving a module with dependencies to an asynchronous service or factory will wait for all dependencies to be done before calling the constructor or function.
