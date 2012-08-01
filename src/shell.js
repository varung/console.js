/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var Console = require("./console").Console,
    extend = require("./util").extend,
    proxy = require("./util").proxy;


var History = exports.History = function() {
    this.history = [null, null];
    this.i = 0;
};

History.prototype = {
    push: function(cmd) {
        this.history.pop();
        this.history.push(cmd);
        this.history.push(null);
        this.i = this.history.length - 1;
        return cmd;
    },

    next: function() {
        this.i = Math.min(this.i + 1, this.history.length - 1);
        return this.history[this.i];
    },

    prev: function() {
        this.i = Math.max(0, this.i - 1);
        return this.history[this.i];
    }
};


var Shell = exports.Shell = function(el, options) {
    this.options = extend({}, Shell.defaults, options);
    this.console = new Console(el, extend({}, options, {
        keybinds: Shell.defaults.keybinds
    }));
    this.console.shell = this;
    this.editor = this.console.editor;
    this.history = new History();
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
            this.history.push(cmd);
            this.puts(ret.toString() + "\n");
            this.prompt();
        }
        return ret;
    };

    this.complete = function() {
        var partialCmd = this.console.getInputUpToCursor();
        console.log(partialCmd);
        var insert = this.options.complete(partialCmd);
        this.console.insert(insert);
    };

    this.historyNext = function() {
        this.options.historyNext(this, this.console);
    };

    this.historyPrev = function() {
        this.options.historyPrev(this, this.console);
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

    keybinds: [{
        name: "historynext",
        bindKey: "Down|Ctrl-N",
        exec: function(console, args) { console.shell.historyNext(args.times); },
        multiSelectAction: "forEach",
        readOnly: true
    }, {
        name: "historyprev",
        bindKey: "Up|Ctrl-P",
        exec: function(console, args) { console.shell.historyPrev(args.times); },
        multiSelectAction: "forEach",
        readOnly: true
    }, {
        name: "expand",
        bindKey: "Tab",
        exec: function(console) { console.shell.complete(); }
    }],

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
     * options.complete(partialCmd)
     * - partialCmd (String): left text entered before hitting completion key;
     * 
     * Returns the completion text. Possible values are:
     * - (null) no suggestion;
     * - (String) text to be completed;
     */
    complete: function(partialCmd) {
        return "";
    },

    /**
     * options.historyNext(shell, console)
     * - shell (Shell instance): the console instance;
     * - console (Console instance): the console instance;
     *
     * Use console.replaceInput(text) to replace the readline content.
     */
    historyNext: function(shell, console) {
        var cmd = shell.history.next();
        if(cmd !== null) {
            console.replaceInput(cmd);
        }
        else if(typeof console.historyHead !== "undefined") {
            console.replaceInput(console.historyHead || "");
            console.historyHeadExpired = true;
        }
    },

    /**
     * options.historyNext(shell, console)
     * - shell (Shell instance): the console instance;
     * - console (Console instance): the console instance;
     *
     * Use console.replaceInput(text) to replace the readline content.
     */
    historyPrev: function(shell, console) {
        var cmd = shell.history.prev();
        if(cmd !== null) {
            if(typeof console.historyHead === "undefined" || console.historyHeadExpired) {
                console.historyHead = console.getInput();
                console.historyHeadExpired = false;
            }
            console.replaceInput(cmd);
        }
        else if(typeof console.historyHead !== "undefined") {
            console.replaceInput("");
        }
    }
};

});
