/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

require([ "require", "ace/ace", "ace/mode/javascript_highlight_rules", "src/shell", "src/console", "src/util" ], function(require) {
    var ace = require("ace/ace");
    var javaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;

    // workers do not work for file:
    if (location.protocol == "file:") {
        var EditSession = require("ace/edit_session").EditSession;
        EditSession.prototype.$useWorker = false;
    }

    var evenParentheses = function(text) {
      return text.split("(").length - text.split(")").length === 0;
    };

    var e1, e2;

    $("body").layout({
      onresize_end: function(pane, element) {
        var editor = element.children()[0].env.editor;
        editor.focus();
        editor.resize();
      }
    });

    ace.edit("e1");
    ace.edit("e2");
});
