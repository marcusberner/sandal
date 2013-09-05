# Sandal

[![Build Status](https://travis-ci.org/marcusberner/molecule-static-files.png?branch=master)](https://travis-ci.org/marcusberner/molecule-static-files)

Sandal is an inversion of control container written in javascript. Sandal works both in node.js and browsers.

## Installation

    $ npm install sandal

## Usage

```js
// For use in browsers, including sandal.js will create a global sandal object
var sandal = require('sandal');

sandal
    .registerService('service1', function (service2, service3) {})
    .registerService('service2', function (service4, done) { setTimeout(function() { done(); }, 500); })
    .registerObject('service3', 'any object')
    .registerService('service4', function () {});
    .resolve(function(service1) {
        // Resolves service1 and all dependencies
    });
```
