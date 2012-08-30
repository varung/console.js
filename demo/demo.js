/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

require([ "require", "ace/ace", "ace/mode/javascript_highlight_rules", "src/shell", "src/console", "src/autocomplete", "src/util" ], function(require) {
    var Autocomplete = require("src/autocomplete").Autocomplete;
    var javaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;

    // workers do not work for file:
    if (location.protocol == "file:") {
        var EditSession = require("ace/edit_session").EditSession;
        EditSession.prototype.$useWorker = false;
    }

    var evenParentheses = function(text) {
      return text.split("(").length - text.split(")").length === 0;
    };

    var Shell = require("src/shell").Shell;
    var shell = window.shell = new Shell("shell", {
        PS1: ">>> ",
        execute: function(cmd, shell) {
            if(!evenParentheses(cmd)) {
              return false;
            }
            var output;
            try {
                output = JSON.stringify(window.eval(cmd));
                output = output ? output + "\n" : "";
            }
            catch(e) {
                output = e.toString() + "\n";
            }
            return output;
        }
    });
    new Autocomplete(shell.console, {
        source: function(request, responseCallback) {
        }
    });
    shell.editor.setTheme("ace/theme/textmate");
    shell.setMode(javaScriptHighlightRules);
    shell.editor.renderer.setShowGutter(false);
    shell.console.setWidth(80);
    shell.focus();
});
