/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

require([ "require", "ace/ace", "src/shell", "src/console", "src/util" ], function(require, ace, shell, console, util) {
    // workers do not work for file:
    if (location.protocol == "file:") {
        var EditSession = require("ace/edit_session").EditSession;
        EditSession.prototype.$useWorker = false;
    }

    var evenParentheses = function(text) {
      return text.split("(").length - text.split(")").length == 0;
    };

    var Shell = require("src/shell").Shell;
    var shell = window._shell = new Shell("shell", {
        PS1: ">>> ",
        execute: function(cmd, shell) {
            if(cmd.length == 0 || !evenParentheses(cmd)) {
              return false;
            }
            var output;
            try {
                output = JSON.stringify(window.eval(cmd)) || "";
            }
            catch(e) {
                output = e.toString();
            }
            return output;
        },
        complete: function(partialCmd) {
            return ".completion.stuff";
        }
    });
    shell.editor.setTheme("ace/theme/textmate");
    shell.editor.session.setMode("ace/mode/javascript");
    shell.focus();
});
