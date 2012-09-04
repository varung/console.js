/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

require([ "require", "ace/ace", "src/myaceeditor", "src/autocomplete", "src/util" ], function(require) {
    var Autocomplete = require("src/autocomplete").Autocomplete;
    var MyAceEditor = require("src/myaceeditor").MyAceEditor;

    // workers do not work for file:
    if (location.protocol == "file:") {
        var EditSession = require("ace/edit_session").EditSession;
        EditSession.prototype.$useWorker = false;
    }

    var editor = new MyAceEditor("editor");
    new Autocomplete(editor, {
        source: function(request, responseCallback) {
            responseCallback(["Alpha", "Beta", "Gamma"]);
        }
    });
    editor.focus();
});
