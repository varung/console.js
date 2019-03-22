/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var Console = require("./console").Console;
var extend = require("./util").extend;
var proxy = require("./util").proxy;
var shellMode = require("./mode/shell").Mode;


var History = exports.History = function() {
    this.history = [null, null];
    this.i = 0;
};

var defaultCommands = [{
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
}];

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
        keybinds: defaultCommands.concat(options.keybinds)
    }));
    this.console.shell = this;
    this.editor = this.console.editor;
    if(this.options.init) {
        this.options.init(this);
    }
    this._promptPositions = [];
    this.prompt();
};

(function(){
    var self = this;

    this.prompt = function() {
        this.write(this.options.PS1);
        // Prompt begin
        this._promptPositions.push(this.editor.getCursorPosition().row);
        this.console.readline( proxy(this.execute, this) );
    };

    this.execute = function(cmd, cb) {
        var self = this;
        // Prompt end, push it in case the command works
        this._promptPositions.push(this.editor.getCursorPosition().row);
        var execute = function(ret) {
            (function() {
                if(ret !== false) {
                    this.options.historyPush(cmd, this);
                    this.write(ret.toString());
                    this.prompt();
                }
                cb(ret);
            }).call(self, ret);
        };
        var ret = this.options.execute(cmd, this, execute);
        if(ret===false || typeof(ret) == "undefined" ) {
            // they told us to continue, so go back to being a prompt
            this._promptPositions.pop();
        }
        if(typeof ret !== "undefined") {
            // succesfully executed cmd
            // print out results
            execute(ret);
            return ret;
        }
    };

    this.historyNext = function() {
        this.options.historyNext(this, this.console);
    };

    this.historyPrev = function() {
        this.options.historyPrev(this, this.console);
    };

    this.insert = function(text) {
        if(text !== null) {
            this.console.insert(text);
        }
    };

    this.isPromptAt = function(row) {
        var i;
        for(i=0; this._promptPositions[i]<=row && i<this._promptPositions.length; i++);
        return i%2 == 1;
    };

    this.setMode = function(promptHighlightRules) {
        var mode = new shellMode(this, this.options.PS1, promptHighlightRules);
        this.editor.session.setMode(mode);
    };

    /**
     * Console proxy
     */
    ["focus", "write"].forEach(function(method) {
        self[method] = function() {
            this.console[method].apply(this.console, arguments);
        };
    });

}).call(Shell.prototype);


/**
 * Defaults
 */
Shell.defaults = {
    /**
     * Prompt String 1
     */
    PS1: "$ ",

    /**
     * options.init(shell)
     * - shell (Shell instance): the shell instance;
     *
     * Returns nothing
     */
    init: function(shell) {
        shell.history = new History();
    },

    /**
     * options.execute(cmd, shell, returnCb)
     * - cmd (String): command to execute;
     * - shell (Shell instance): the shell instance;
     * - returnCb (function(ret)): callback function;
     *   - ret: the same return values below except undefined;
     *
     * Returns the execution output. Possible values are:
     * - (undefined) halt, will use callback to send output asynchronously;
     * - (false) holds execution, needs more input, allow multi-line command;
     * - (String) execution output
     */
    execute: function(cmd, shell) {
        return cmd + "\n";
    },

    /**
     * options.complete(partialCmd, console)
     * - partialCmd (String): left text entered before hitting completion key;
     * - shell (Shell instance): the shell instance;
     * 
     * Returns the completion text. Possible values are:
     * - (undefined) halt, will use callback to send output asynchronously;
     * - (null) no suggestion;
     * - (String) text to be completed;
     */
    complete: function(partialCmd, shell) {
        return "";
    },

    /**
     * options.historyPush(cmd, shell)
     * - cmd (String): command executed;
     * - shell (Shell instance): the console instance;
     *
     * Returns nothing
     */
    historyPush: function(cmd, shell) {
        shell.history.push(cmd);
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
