/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
var ShellHighlightRules = require("./shell_highlight_rules").ShellHighlightRules;

var Mode = function(shell, PS1, promptHighlightRules) {
    var highlightRules = new ShellHighlightRules(shell, PS1, promptHighlightRules).getRules();
    this.$tokenizer = new Tokenizer(highlightRules);
};

oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;

});
