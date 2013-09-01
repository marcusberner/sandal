# Sandal

[![Build Status](https://travis-ci.org/marcusberner/molecule-static-files.png?branch=master)](https://travis-ci.org/marcusberner/molecule-static-files)

Sandal is an inversion of control container written in javascript. Sandal works both in node.js and browsers.

## Installation

    $ npm install sandal

## Usage

```js
// For use in browsers, including sandal.js will create a global sandal object
var sandal = require('sandal');

sandal.register('service1', function (service2, service3) {}, 'transient');
sandal.register('service2', function (service4) {}, 'singleton');
sandal.register('service3', 'any object'); // Singleton is default
sandal.register('service4', function () {});

var service = sandal.resolve('service1');
```
