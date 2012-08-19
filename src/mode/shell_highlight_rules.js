/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

var ShellHighlightRules = function(shell, PS1, promptHighlightRules) {
    var escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    this.$rules = {
        start: [{
            token: "PS1",
            regex: "^" + escapeRegExp(PS1),
            next: "prompt-start"
        }]
    };
    this.embedRules(promptHighlightRules, "prompt-", [{
        token : function(m1, row) {
            return shell.isPromptAt(row) ? {
                next: "start",
                type:"prompt-end"
            } : {
                next: null,
                type: "nobigdeal"
            };
        },
        regex: "$"
    }]);
}

oop.inherits(ShellHighlightRules, TextHighlightRules);

exports.ShellHighlightRules = ShellHighlightRules;

});
