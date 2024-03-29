/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 */

define(function(require, exports, module) {
"use strict";

var ace = require("ace/ace"),
    CommandManager = require("ace/commands/command_manager").CommandManager,
    extend = require("./util").extend,
    lang = require("ace/lib/lang"),
    proxy = require("./util").proxy,
    Range = require("ace/range").Range,
    useragent = require("ace/lib/useragent");

var slice = Array.prototype.slice;

function bindKey(win, mac) {
    return {
        win: win,
        mac: mac
    };
}

var defaultCommands = [{
    name: "overwrite",
    bindKey: "Insert",
    exec: function(editor) { editor.toggleOverwrite(); },
    readOnly: true
}, {
    name: "gotostart",
    bindKey: bindKey("Ctrl-Home", "Command-Home|Command-Up"),
    exec: function(editor) { editor.console.navigateFileStart(); },
    readOnly: true
}, {
    name: "gotoend",
    bindKey: bindKey("Ctrl-End", "Command-End|Command-Down"),
    exec: function(editor) { editor.console.navigateFileEnd(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotowordleft",
    bindKey: bindKey("Ctrl-Left", "Option-Left"),
    exec: function(editor) { editor.console.navigateWordLeft(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotolinestart",
    bindKey: bindKey("Alt-Left|Home|Ctrl-A", "Command-Left|Home|Ctrl-A"),
    exec: function(editor) { editor.console.navigateLineStart(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotoleft",
    bindKey: bindKey("Left", "Left"),
    exec: function(editor, args) { editor.console.navigateLeft(args.times); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotowordright",
    bindKey: bindKey("Ctrl-Right", "Option-Right"),
    exec: function(editor) { editor.console.navigateWordRight(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotolineend",
    bindKey: bindKey("Alt-Right|End|Ctrl-E", "Command-Right|End|Ctrl-E"),
    exec: function(editor) { editor.console.navigateLineEnd(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "gotoright",
    bindKey: bindKey("Right|Ctrl-F", "Right|Ctrl-F"),
    exec: function(editor, args) { editor.console.navigateRight(args.times); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectall",
    bindKey: bindKey("Ctrl-A", "Command-A"),
    exec: function(editor) { editor.console.selectAll(); },
    readOnly: true
}, {
    name: "selecttostart",
    bindKey: bindKey("Ctrl-Shift-Home", "Command-Shift-Up"),
    exec: function(editor) { editor.console.selectFileStart(); },
    readOnly: true
}, {
    name: "selectup",
    bindKey: bindKey("Shift-Up", "Shift-Up"),
    exec: function(editor) { editor.console.selectUp(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selecttoend",
    bindKey: bindKey("Ctrl-Shift-End", "Command-Shift-Down"),
    exec: function(editor) { editor.console.selectFileEnd(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectdown",
    bindKey: bindKey("Shift-Down", "Shift-Down"),
    exec: function(editor) { editor.console.selectDown(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectwordleft",
    bindKey: bindKey("Ctrl-Shift-Left", "Option-Shift-Left"),
    exec: function(editor) { editor.console.selectWordLeft(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selecttolinestart",
    bindKey: bindKey("Alt-Shift-Left", "Command-Shift-Left"),
    exec: function(editor) { editor.console.selectLineStart(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectleft",
    bindKey: bindKey("Shift-Left", "Shift-Left"),
    exec: function(editor) { editor.console.selectLeft(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectwordright",
    bindKey: bindKey("Ctrl-Shift-Right", "Option-Shift-Right"),
    exec: function(editor) { editor.console.selectWordRight(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selecttolineend",
    bindKey: bindKey("Alt-Shift-Right", "Command-Shift-Right"),
    exec: function(editor) { editor.console.selectLineEnd(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectright",
    bindKey: bindKey("Shift-Right", "Shift-Right"),
    exec: function(editor) { editor.console.selectRight(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectpagedown",
    bindKey: "Shift-PageDown",
    exec: function(editor) { editor.console.selectPageDown(); },
    readOnly: true
}, {
    name: "selectpageup",
    bindKey: "Shift-PageUp",
    exec: function(editor) { editor.console.selectPageUp(); },
    readOnly: true
}, {
    name: "selectlinestart",
    bindKey: "Shift-Home",
    exec: function(editor) { editor.console.selectLineStart(); },
    multiSelectAction: "forEach",
    readOnly: true
}, {
    name: "selectlineend",
    bindKey: "Shift-End",
    exec: function(editor) { editor.console.selectLineEnd(); },
    multiSelectAction: "forEach",
    readOnly: true
}, 

// commands disabled in readOnly mode
{
    name: "enter",
    bindKey: "Return",
    exec: function(editor) { editor.console.enter(); }
}, {
    name: "cut",
    exec: function(editor) {
        var range = editor.console.getSelectionRange();
        editor._emit("cut", range);
        if (!editor.selection.isEmpty()) {
          editor.session.remove(range);
          editor.clearSelection();
        }
    },
    multiSelectAction: "forEach"
}, {
    name: "undo",
    bindKey: bindKey("Ctrl-Z", "Command-Z"),
    exec: function(editor) { editor.undo(); }
}, {
    name: "redo",
    bindKey: bindKey("Ctrl-Shift-Z|Ctrl-Y", "Command-Shift-Z|Command-Y"),
    exec: function(editor) { editor.redo(); }
}, {
    name: "del",
    bindKey: bindKey("Delete|Ctrl-D", "Delete|Ctrl-D"),
    exec: function(editor) { editor.remove("right"); },
    multiSelectAction: "forEach"
}, {
    name: "backspace",
    bindKey: bindKey(
        "Command-Backspace|Option-Backspace|Shift-Backspace|Backspace",
        "Ctrl-Backspace|Command-Backspace|Shift-Backspace|Backspace|Ctrl-H"
    ),
    exec: function(editor) { editor.console.remove("left"); },
    multiSelectAction: "forEach"
}, {
    name: "removetolinestart",
    bindKey: bindKey("Alt-Backspace", "Command-Backspace"),
    exec: function(editor) { editor.console.removeToLineStart(); },
    multiSelectAction: "forEach"
}, {
    name: "removetolineend",
    bindKey: bindKey("Alt-Delete|Ctrl-K", "Ctrl-K"),
    exec: function(editor) { editor.console.removeToLineEnd(); },
    multiSelectAction: "forEach"
}, {
    name: "removewordleft",
    bindKey: bindKey("Ctrl-Backspace|Ctrl-W", "Alt-Backspace|Ctrl-Alt-Backspace|Ctrl-W"),
    exec: function(editor) { editor.console.removeWordLeft(); },
    multiSelectAction: "forEach"
}, {
    name: "removewordright",
    bindKey: bindKey("Ctrl-Delete", "Alt-Delete"),
    exec: function(editor) { editor.console.removeWordRight(); },
    multiSelectAction: "forEach"
}, {
    name: "insertstring",
    exec: function(editor, str) { editor.console.insert(str); },
    multiSelectAction: "forEach"
}, {
    name: "inserttext",
    exec: function(editor, args) {
        editor.console.insert(lang.stringRepeat(args.text  || "", args.times || 1));
    },
    multiSelectAction: "forEach"
}];

var Console = exports.Console = window.Console = function(el, options) {
    var self = this;
    var editor = this.editor = ace.edit(el);
    this.options = extend({}, Console.defaults, options);
    this.buffer = "";
    editor.console = this;
    this.cursor = this.editor.getCursorPosition();
    this.boundary = new Range.fromPoints(this.cursor, this.cursor);

    editor.setReadOnly(true);
    editor.session.setUseWrapMode(true);
    editor.setHighlightActiveLine(false);
    editor.on("click", proxy(this.onCursorMove, this));

    // Overloading editor.selectAll, because of quadclick. Otherwise, cannot
    // workaround it
    this._selectAll = editor.selectAll;
    editor.selectAll = proxy(this.selectAll, this);

    // Overloading editor.onPaste
    this._onPaste = editor.onPaste;
    editor.onPaste = proxy(this.onPaste, this);

    // Disabling drag n' drop
    this._$mouseHandler = {
        startDrag: editor.$mouseHandler.startDrag,
        dragWait: editor.$mouseHandler.dragWait,
        dragWaitEnd: editor.$mouseHandler.dragWaitEnd,
        drag: editor.$mouseHandler.drag,
        dragEnd: editor.$mouseHandler.dragEnd
    };
    var nullFunc = function() {};
    editor.$mouseHandler.startDrag = nullFunc;
    editor.$mouseHandler.startDrag = nullFunc;
    editor.$mouseHandler.dragWait = nullFunc;
    editor.$mouseHandler.dragWaitEnd = nullFunc;
    editor.$mouseHandler.drag = nullFunc;
    editor.$mouseHandler.dragEnd = nullFunc;

    // Combining default commands with option.keybinds
    var commands = new CommandManager(
        useragent.isMac ? "mac" : "win",
        defaultCommands.concat(options.keybinds.map(function(command) {
            return extend({}, command, {
                exec: function(editor) {
                    var shifted_args = slice.call(arguments, 1);
                    command.exec.apply(this, [self].concat(shifted_args));
                }
            });
        }))
    );

    var handleKeyboard = commands.handleKeyboard;
    commands.handleKeyboard = function(data, hashId, keyString, keyCode, ev) {
        var args = [self].concat(slice.call(arguments, 0));
        var command = this.findKeyCommand(hashId, keyString);
        var isEditorReadOnly = self.editor.getReadOnly();

        if(hashId == -1 || command) {
            self.fixCursorOrSelection.call(self);
        }

        // Normal keys
        if(hashId == -1) {
            if(!self.options.handleKeyboard.apply(this, args)) {
                // way to cancel bubbling
                return {command: {exec: function() {return true;}}};
            }
            if(isEditorReadOnly) {
                self.buffer += keyString;
                return {command: {exec: function() {return true;}}};
            }
            return handleKeyboard.apply(this, arguments);
        }
        // Commands
        else {
            if(
                self.options.handleKeyboard.apply(this, args) &&
                !isEditorReadOnly
            ) {
                // keep going
                return handleKeyboard.apply(this, arguments);
            }
        }
    };

    // Seting our custom key bindings
    this._commands = editor.commands;
    this._handlers = editor.keyBinding.$handlers;
    editor.commands = commands;
    editor.keyBinding.$handlers = [];
    editor.keyBinding.setDefaultHandler(commands);

    editor.setStyle("console-mode");
};

(function(){
    var self = this;

    this._clearUndo = function() {
        this.editor.session.$deltasFold = [];
        this.editor.session.$deltasDoc = [];
        this.editor.session.getUndoManager().reset();
    };

    this._fixCursor = function() {
        if(!this._isInBoundary(this.editor.getCursorPosition())) {
            this.moveCursorTo(this.cursor.row, this.cursor.column);
            this.editor.clearSelection();
        }
    };

    this._fixSelection = function() {
        var selectionRange = this.editor.getSelectionRange();
        var reverse = this.editor.getSelection().isBackwards();
        if(!this._isSelectionInBoundary()) {
            var boundary = this.boundary;
            selectionRange.start = boundary.start;
            if(selectionRange.end.row < boundary.start.row || (selectionRange.end.row === boundary.start.row && selectionRange.end.column < boundary.start.column)) {
                selectionRange.end = boundary.start;
                
            }
            this.editor.selection.setSelectionRange(selectionRange, reverse);
        }
        return selectionRange;
    };

    this._isInBoundary = function(point) {
        var bs = this.boundary.start;
        return point.row > bs.row ||
            (point.row == bs.row && point.column >= bs.column);
    };

    this._isSelectionInBoundary = function() {
        var selectionRange = this.editor.getSelectionRange();
        return selectionRange.comparePoint(this.boundary.start) == -1;
    };

    this._flushBuffer = function() {
        if(this.buffer.length > 0) {
            var buffer = this.buffer;
            this.buffer = "";
            this.insert(buffer);
        }
    };

    this._updateCursor = function() {
        this.cursor = this.editor.getCursorPosition();
    };

    this.enter = function() {
        var self = this;
        var cb = this._inputCallback;
        delete this._inputCallback;
        var input = this.getInput();
        this.navigateFileEnd();
        this.write("\n");
        this.editor.setReadOnly(true);
        var finalStuff = function(ret) {
            if(ret === false) {
                // Multi-line
                self._inputCallback = cb;
                self.editor.setReadOnly(false);
                self._flushBuffer.call(self);
            }
        };
        var ret = cb(input, finalStuff);
        if(typeof ret !== "undefined") {
            finalStuff(ret);
        }
    };

    this.fixCursorOrSelection = function() {
        if(this.editor.selection.isEmpty()) {
            this._fixCursor();
        }
        else {
            this._fixSelection();
        }
    };

    this.getInput = function() {
        var cursor = this.cursor;
        this.navigateFileEnd();
        var input = this.getInputUpToCursor();
        this.moveCursorTo(cursor.row, cursor.column);
        return input;
    };

    this.getInputUpToCursor = function() {
        this.boundary.setEnd(this.cursor.row, this.cursor.column);
        return this.editor.session.getTextRange(this.boundary);
    };

    this.getSelectionRange = function() {
        return this._fixSelection();
    };

    this.readline = function(cb) {
        if(this._inputCallback) {
            throw "Already reading line";
        }
        this.cursor = this.editor.getCursorPosition();
        this._inputCallback = cb;
        this.boundary.setStart(this.cursor.row, this.cursor.column);
        delete this.historyHead;
        this.editor.setReadOnly(false);
        this._flushBuffer();
        this._clearUndo();
    };

    this.replaceInput = function(text) {
        this.selectAll();
        this.editor.session.remove(this.editor.getSelectionRange());
        this.editor.clearSelection();
        this.insert(text);
    };

    this.setWidth = function(value) {
        this.editor.session.adjustWrapLimit(value);
        this.editor.renderer.setPrintMarginColumn(value);
    };

    this.write = function(text) {
        this.editor.insert(text);
    };

    // Insert
    this.insert = function(text) {
        if(!this._inputCallback) {
            buffer += text;
        }
        else {
            this.editor.insert.apply(this.editor, arguments);
            this._updateCursor();
        }
    };

    // Navigate
    this.navigateFileStart = function() {
        var boundary = this.boundary;
        this.moveCursorTo(boundary.start.row, boundary.start.column);
        this._updateCursor();
    };
    this.navigateFileEnd = function() {
        this.editor.navigateFileEnd.apply(this.editor, arguments);
        this._updateCursor();
    };
    this.navigateLeft = function() {
        this.editor.navigateLeft.apply(this.editor, arguments);
        this._fixCursor();
        this._updateCursor();
    };
    this.navigateLineEnd = function() {
        this.editor.navigateLineEnd.apply(this.editor, arguments);
        this._updateCursor();
    };
    this.navigateLineStart = function() {
        var cursor = this.cursor,
            boundary = this.boundary;
        if(cursor.row == boundary.start.row) {
            this.moveCursorTo(boundary.start.row, boundary.start.column);
        }
        else {
            this.editor.navigateLineStart.apply(this.editor, arguments);
        }
        this._updateCursor();
    };
    this.navigateRight = function() {
        this.editor.navigateRight.apply(this.editor, arguments);
        this._updateCursor();
    };
    this.navigateWordLeft = function() {
        var cursor;
        this.editor.navigateWordLeft.apply(this.editor, arguments);
        cursor = this.editor.getCursorPosition();
        if(!this._isInBoundary(cursor)) {
            var boundary = this.boundary;
            this.moveCursorTo(boundary.start.row, boundary.start.column);
        }
        this._updateCursor();
    };
    this.navigateWordRight = function() {
        this.editor.navigateWordRight.apply(this.editor, arguments);
        this._updateCursor();
    };

    // Remove
    this.remove = function(dir) {
        if (this.editor.selection.isEmpty()){
            if (dir == "left")
                this.editor.selection.selectLeft();
            else
                this.editor.selection.selectRight();
        }
        var selectionRange = this.getSelectionRange();
        if (this.editor.getBehavioursEnabled()) {
            var session = this.editor.session;
            var state = session.getState(selectionRange.start.row);
            var new_range = session.getMode().transformAction(state, 'deletion', this, session, selectionRange);
            if (new_range)
                selectionRange = new_range;
        }
        this.editor.session.remove(selectionRange);
        this.editor.clearSelection();
        this._updateCursor();
    };
    this.removeToLineEnd = function() {
        this.editor.removeToLineEnd.apply(this.editor, arguments);
        this._updateCursor();
    };
    this.removeToLineStart = function() {
        if(this.editor.selection.isEmpty())
            this.editor.selection.selectLineStart();
        var selectionRange = this.getSelectionRange();
        this.editor.session.remove(selectionRange);
        this.editor.clearSelection();
        this._updateCursor();
    };
    this.removeWordLeft = function() {
        if (this.editor.selection.isEmpty())
            this.editor.selection.selectWordLeft();
        var selectionRange = this.getSelectionRange();
        this.editor.session.remove(selectionRange);
        this.editor.clearSelection();
        this._updateCursor();
    };
    this.removeWordRight = function() {
        this.editor.removeWordRight.apply(this.editor, arguments);
        this._updateCursor();
    };

    // Select
    this.selectAll = function() {
        this._selectAll.apply(this.editor, arguments);
        this._fixSelection();
        this._updateCursor();
    };
    ["selectPageDown", "selectPageUp"].forEach(function(method) {
        self[method] = function() {
            this.editor[method].apply(this.editor, arguments);
            this._fixSelection();
            this._updateCursor();
        };
    });
    ["selectFileStart", "selectUp", "selectFileEnd", "selectDown",
     "selectWordLeft", "selectLineStart", "selectLeft", "selectWordRight",
     "selectLineEnd", "selectRight", "selectLineStart", "selectLineEnd"
    ].forEach(function(method) {
        self[method] = function() {
            this.editor.getSelection()[method]();
            this._fixSelection();
            this._updateCursor();
        };
    });

    /**
     * Editor proxy
     */
    ["_emit", "focus", "getCursorPosition", "moveCursorTo"].forEach(function(method) {
        self[method] = function() {
            this.editor[method].apply(this.editor, arguments);
        };
    });

    /**
     * Events
     */
    this.onCursorMove = function() {
        if(this._isInBoundary(this.editor.getCursorPosition())) {
            this._updateCursor();
        }
    };

    this.onPaste = function(text) {
        this.fixCursorOrSelection();
        this._onPaste.apply(this, arguments);
    };

    /**
     * Destroy
     */
    this.destroy = function() {
        var editor = this.editor;
        editor.removeListener("click", this.onCursorMove);
        editor.selectAll = this._selectAll;
        editor.onPaste = this._onPaste;
        editor.$mouseHandler.startDrag = this._$mouseHandler.startDrag;
        editor.$mouseHandler.startDrag = this._$mouseHandler.startDrag;
        editor.$mouseHandler.dragWait = this._$mouseHandler.dragWait;
        editor.$mouseHandler.dragWaitEnd = this._$mouseHandler.dragWaitEnd;
        editor.$mouseHandler.drag = this._$mouseHandler.drag;
        editor.$mouseHandler.dragEnd = this._$mouseHandler.dragEnd;
        editor.commands = this._commands;
        editor.keyBinding.$handlers = this._handlers;
        editor.unsetStyle("console-mode");
    };

}).call(Console.prototype);


/**
 * Defaults
 */
Console.defaults = {
    /**
     * options.keybinds = []    // Custom keybinds
     * - For more information on the data structure, see:
     *   ace/commands/default_commands;
     * - OBS: exec(console) instead of exec(editor)
     */
    keybinds: [],

    /**
     * options.handleKeyboard(data, hashId, keyString, keyCode)
     * - console (Console instance): the console instance;
     * - other arguments: for more details, see
     *   ace/keyboard/hash_handler#handleKeyboard, and
     *   ace/keyboard/keybinding#$callKeyboardHandlers;
     *
     * Returns whether or not to echo the character:
     * - (true) to echo;
     * - (false) NOT to echo;
     */
    handleKeyboard: function(console, data, hashId, keyString, keyCode) {
        return true;
    }
};

});
