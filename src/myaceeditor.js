/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var ace = require("ace/ace");
var Editor = require("ace/editor").Editor;
var event = require("ace/lib/event");


var MyAceEditor = exports.MyAceEditor = window.MyAceEditor = function(el, options) {
    var editor;
    // This needs to be overloaded before instance creation, because:
    // event.addCommandKeyListener(text, host.onCommandKey.bind(host));
    var _onCommandKey = Editor.prototype.onCommandKey;
    Editor.prototype.onCommandKey = function(ev, hashId, keyCode) {
        editor._emit("commandKey", {
            ev: ev,
            hashId: hashId,
            keyCode: keyCode,
            preventDefault: function() {
                this.defaultPrevented = true;   // preventDefault commandKey
                event.preventDefault(ev);       // preventDefault keydown
                event.stopPropagation(ev);      // stopPropagation keydown
            }
        });
    };
    editor = this.editor = ace.edit(el);
    Editor.prototype.onCommandKey = _onCommandKey;

    editor._onCommandKey = _onCommandKey;
    editor._onTextInput = editor.onTextInput;
    editor.onTextInput = function(text, pasted) {
        editor._emit("textInput", {text: text, pasted: pasted});
    };
    editor.setDefaultHandler("commandKey", function(ev) {
        editor._onCommandKey.call(editor, ev.ev, ev.hashId, ev.keyCode);
    });
    editor.setDefaultHandler("textInput", function(ev) {
        editor._onTextInput.call(editor, ev.text);
    });

    return editor;
};

(function(){

    /**
     * Destroy
     */
    this.destroy = function() {
        var editor = this.editor;
        editor.onCommandKey = editor._onCommandKey;
        editor.onTextInput = editor._onTextInput;
    };

}).call(MyAceEditor.prototype);

});
