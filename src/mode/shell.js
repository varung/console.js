/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;

var Mode = function(shell, PS1, promptHighlightRules) {
    var highlightRules = new promptHighlightRules().getRules();
    this.$tokenizer = new Tokenizer(highlightRules);
    this.$tokenizer.oldGetLineTokens = this.$tokenizer.getLineTokens;
    this.$tokenizer.getLineTokens = function(line, startState, row) {
        var res = this.oldGetLineTokens(line,startState,row);
        if(!shell.isPromptAt(row)) {
            var type = "text";
            if(line.indexOf("Error") != -1) type = "invalid";
            res = { state: "start", tokens : [ { type: type, value: line } ] };
        }
        return res;
   }
};

oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;

});
