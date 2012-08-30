/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 *
 * Deps:
 * - jQuery UI
 */

define(function(require, exports, module) {
"use strict";

var EventEmitter = require("ace/lib/event_emitter").EventEmitter;
var extend = require("./util").extend;
var oop = require("ace/lib/oop");
var proxy = require("./util").proxy;
var keys = require("ace/lib/keys");

var Autocomplete = exports.Autocomplete = function(console, options) {
    this.console = console;
    this.options = extend({}, Autocomplete.defaults, options);
    this.isActive = false;
    console.on("textInput", proxy(this.textInput, this) );
    console.on("commandKey", proxy(this.commandKey, this) );
};

(function() {

    oop.implement(this, EventEmitter);

    this.close = function() {
        if(this.isActive) {
            // close autocomplete down
            this.isActive = false;
        }
    };

    this.commandKey = function(event) {
        console.log("commandKey", "hashId", event.hashId, "keyCode", event.keyCode);
        if(this.isActive) {
            switch(event.keyCode) {
            case keys.ENTER:
            case keys.TAB:
                // Pick selection
                break;
            case keys.UP:
                // Select previous
                break;
            case keys.DOWN:
                // Select next
                break;
            default:
                return;
            }
        }
        else {
            switch(event.keyCode) {
            default:
                return;
            }
        }
        event.preventDefault();
    };

    this.open = function() {
        if(this._source.length > 0) {
            if(!this.isActive) {
                // open autocomplete up
                this.isActive = true;
            }
            // update autocomplete list
        }
        else {
            if(!this.isActive) this.close();
        }
    };

    this.search = function(term) {
        var self = this;
        this.options.source(term, function(res) {
            self._source = res || [];
            self.open.call(self);
        });
    };

    this.textInput = function(event) {
        console.log("textInput", "text", event.text, "pasted", event.pasted);
        this.search(this.console.getInputUpToCursor());
    };

}).call(Autocomplete.prototype);


/**
 * Defaults
 */
Autocomplete.defaults = {
    /**
     * options.source(term, responseCallback)
     * FIXME
     * - term (String): the content up to the cursor;
     * - responseCallback (function(res)): callback function;
     *   - res is an array of objects (maps), containing two required
     *     properties:
     *     - A label property to display in the autocomplete list ("John Doe
     *       <john@doe.com>");
     *     - A value property that ends up in the input field once selected
     *       ("john@doe.com"). If undefined, same as label;
     */
    source: function(term, responseCallback) {
    }
};

});
