/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var oop = require("ace/lib/oop");
var TextMode = require("ace/mode/text").Mode;
var Tokenizer = require("ace/tokenizer").Tokenizer;
//var ShellHighlightRules = require("./shell_highlight_rules").ShellHighlightRules;

var Mode = function(shell, PS1, promptHighlightRules) {
    //var highlightRules = new ShellHighlightRules(shell, PS1, promptHighlightRules).getRules();
    var highlightRules = new promptHighlightRules().getRules();
    //console.log(highlightRules)
    //var highlightRules = promptHighlightRules;
    this.$tokenizer = new Tokenizer(highlightRules);
    this.$tokenizer.$shell = shell;
    this.$tokenizer.oldGetLineTokens = this.$tokenizer.getLineTokens;
    //console.log(this.$tokenizer.oldGetLineTokens(0,null,0));
    this.$tokenizer.getLineTokens = function(line, startState, row) {
        console.log( ((this.$shell.isPromptAt(row))?"[PROMPT]":"[NOT PROMPT]") + ":"+ line);
        var res = this.oldGetLineTokens(line,startState,row);
        if(!this.$shell.isPromptAt(row)) {
            var type = "text";
            if(line.indexOf("Error") != -1) type = "invalid";
            res = { state: "start", tokens : [ { type: type, value: line } ] };
        }
        //console.log(res);
        return res;
   }
};

oop.inherits(Mode, TextMode);

(function() {
    // Extra logic goes here. (see below)
}).call(Mode.prototype);

exports.Mode = Mode;

});
