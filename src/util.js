/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");

/**
 * Merge the contents of two or more objects together into the first object.
 */
exports.extend = function(firstObj) {
    var otherObjs = Array.prototype.slice.call(arguments, 1);
    return otherObjs.reduce(function(obj, mixin) {
        oop.mixin(obj, mixin);
        return obj;
    }, firstObj);
};

/**
 * Takes a function and returns a new one that will always have a particular
 * context.
 */
exports.proxy = function(fn, context) {
    return function() {
        return fn.apply(context, arguments);
    };
};

});
