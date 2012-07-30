/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var Console = require("./console").Console,
    extend = require("./util").extend,
    proxy = require("./util").proxy;


var Shell = exports.Shell = function(el, options) {
    this.options = extend({}, Shell.defaults, options);
    this.console = new Console(el, extend({}, options, {
        completion: proxy(this.completion, this)
    }));
    this.editor = this.console.editor;
    this.prompt();
};

(function(){
    var self = this;

    this.prompt = function() {
        this.puts(this.options.PS1);
        this.console.readline( proxy(this.execute, this) );
    };

    this.execute = function(cmd) {
        var ret = this.options.execute(cmd, this);
        if(ret !== false) {
            this.puts(ret.toString() + "\n");
            this.prompt();
        }
        return ret;
    };

    this.completion = function(partialCmd) {
        return this.options.completion(partialCmd);
    };

    /**
     * Console proxy
     */
    ["focus", "puts"].forEach(function(method) {
        self[method] = function() {
            this.console[method].apply(this.console, arguments);
        };
    });

}).call(Shell.prototype);


/**
 * Defaults
 */
Shell.defaults = {
    PS1: "$ ",

    /**
     * options.execute(cmd, shell)
     * - cmd (String): command to execute;
     * - shell (Shell instance): the shell instance;
     *
     * Returns the execution output. Possible values are:
     * - (false) holds execution, needs more input, allow multi-line command;
     * - (String) execution output
     */
    execute: function(cmd, shell) {
        return cmd;
    },

    /**
     * options.completion(partialCmd)
     * - partialCmd (String): left text entered before hitting completion key;
     * 
     * Returns the completion text. Possible values are:
     * - (null) no suggestion;
     * - (String) text to be completed;
     */
    completion: function(partialCmd) {
        return "";
    }
};

});
