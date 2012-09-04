/* vim:ts=4:sts=4:sw=4:
 * Author: Rafael Xavier <rxaviers at gmail.com>
 * Copyright (C) 2012 Varun Ganapathi
 *
 * Deps:
 * - jQuery UI
 */

define(function(require, exports, module) {
"use strict";

var EventEmitter = require("ace/lib/event_emitter").EventEmitter;
var extend = require("./util").extend;
var oop = require("ace/lib/oop");
var proxy = require("./util").proxy;
var keys = require("ace/lib/keys");


function scrollIntoView(element, container) {
  var containerTop = $(container).scrollTop();
  var containerBottom = containerTop + $(container).height();
  var elemTop = element.offsetTop;
  if (elemTop < containerTop) {
    var elemBottom = elemTop + $(element).height();
    $(container).scrollTop(elemTop);
    } else if (elemBottom > containerBottom) {
    $(container).scrollTop(elemBottom - $(container).height());
  }
}


// Varun's AutoComplete
$("<div></div>").attr("id", "autocomplete_outer").appendTo("body").append(
  $("<div></div>").attr("id", "autocomplete_list")
);
function autoComplete() {
  // changing items
  var items, highlightCB, chooseCB;
  var selected = 0; // currently selected item
  var ol; // ordered list element which contains items

  function selectItem(id) {
    selected = parseInt(id, 10);
    ol.children().removeClass('selected');
    var item = ol.children()[id];
    $(item).addClass('selected');
    scrollIntoView(item, '#autocomplete_list');
    if(highlightCB) {
      highlightCB(items[selected], selected);
    }
  }

  // set up autocomplete, with pointers to the above vars
  $('#autocomplete_outer')
    .bind("up", function() {
      selectItem((selected + items.length - 1) % (items.length));
    })
    .bind("down", function() {
      selectItem((selected + 1) % (items.length));
    })
    .bind("pgup", function() {
      // FIXME the below round leads to negative numbers
      selectItem((selected+items.length-8)%(items.length));
    })
    .bind("pgdown", function() {
      selectItem((selected+8)%(items.length));
    })
    .bind("pick", function() {
      $('#autocomplete_outer').hide();
      chooseCB(items[selected], selected);
    })
    .bind("hide", function() {
      $('#autocomplete_outer').hide();
      chooseCB(null);
    });

  function genHandler(idx) {
    return function() {
      chooseCB(items[idx], idx);
      $('#autocomplete_outer').hide();
    };
  }

  function ItemHover(ev) { $(this).addClass("hover"); }
  function ItemUnHover(ev) { $(this).removeClass("hover"); }

  // return function that changes above and then updates div
  // eventhandlers will be reused
  return function(top, left, in_items, in_handleHighlight, in_ChooseCB, flip) {
    items = in_items;
    //handleCB = in_handleHighlight;
    chooseCB = in_ChooseCB;
    // create list. (could reuse existing ol and just update items in it)
    ol = $('<ul>').addClass('autocomplete');
    for (var i in items) {
      var item = $('<li><span>' + items[i] + '</span></li>').appendTo(ol);
      $(item).click(genHandler(parseInt(i, 10)));
      $(item).hover(ItemHover, ItemUnHover);
    }
    // clear existing one
    $('#autocomplete_list').empty();
    $('#autocomplete_list').append(ol);
    selectItem(0);

    // show autocomplete list at cursor location
    $("#autocomplete_outer").css({ position:"absolute", top:top+16, left:left }).show();
    // ghetto, but move it up quickly. could try to use z-index insted?
    var info = { top:top, left:left, height:$('#autocomplete_list').height() };
    if(flip) {
      $("#autocomplete_outer").css({top:top-info.height});
    }
    $('#autocomplete_outer').focus();
  };
}
var showListAtLocation = autoComplete();



var Autocomplete = exports.Autocomplete = function(editor, options) {
    this.editor = editor;
    this.options = extend({}, Autocomplete.defaults, options);
    this.isActive = false;
    editor.on("commandKey", proxy(this.myCommandKey, this) );
    editor.on("textInput", proxy(this.myTextInput, this) );
};

(function() {

    oop.implement(this, EventEmitter);

    this.close = function() {
        if(this.isActive) {
            // close autocomplete down
            this.isActive = false;
            this.myClose();
        }
    };

    this.cursorCoords = function() {
        // TODO: might it be better to get an offset version rather than hard coding 16
        var position = this.editor.getCursorPosition(),
            coords = this.editor.renderer.textToScreenCoordinates(position.row, position.column);
        return [coords.pageX, coords.pageY];
    };

    // returns y location of bottom most row
    this.bottomCoords = function() {
        var renderer = this.console.editor.renderer;
        //var lastRow = renderer.getLastFullyVisibleRow();
        //console.log("lastRow:" + lastRow);
        //var coords = renderer.textToScreenCoordinates( lastRow, 0);
        return $(renderer.getContainerElement()).height();
    }

    this.show = function(source) {
        if(source.length > 0) {
            if(!this.isActive) {
                this.isActive = true;
                // Show autocomplete up
                var coords = this.cursorCoords();
                this.myShow(coords[0], coords[1], source);
            }
            else {
                // Update autocomplete list
                this.myUpdate(source);
            }
        }
        else {
            if(!this.isActive) this.close();
        }
    };

    this.search = function() {
        this.editor.selection.selectWordLeft();
        var selectionRange = this.getSelectionRange();
        this.editor.clearSelection();
        return this.editor.session.getTextRange(selectionRange);
    };

    this._search = function(term) {
        var self = this;
        this.options.source(term, function(res) {
            var source = res || [];
            self.show.call(self, source);
        });
    };

    this.complete = function(str) {
        if(str) {
            this.editor.insert(str);
        }
    };

    // -------------------
    // YOUR CODE GOES HERE
    // -------------------

    this.myClose = function() {
        $('#autocomplete_outer').triggerHandler("hide");
    };

    // 2. Some place where I receive the key press events
    this.myCommandKey = function(event) {
        console.log("commandKey", "hashId", event.hashId, "keyCode", event.keyCode);
        var autocomplete = $('#autocomplete_outer');

        if(this.isActive) {
            switch(event.keyCode) {
            case keys.RETURN:
            case keys.TAB:
                // Pick selection
                autocomplete.triggerHandler("pick");
                this.close();
                break;
            case keys.UP:
                // Select previous
                autocomplete.triggerHandler("up");
                break;
            case keys.DOWN:
                // Select next
                autocomplete.triggerHandler("down");
                break;
            case keys.PAGEUP:
                // Select previous page
                autocomplete.triggerHandler("pgup");
                break;
            case keys.PAGEDOWN:
                // Select next page
                autocomplete.triggerHandler("pgdown");
                break;
            case keys.LEFT:
            case keys.RIGHT:
            case keys.ESC:
                this.close();
                break;
            case 80: // 'p'
                if(event.hashId == keys.KEY_MODS.ctrl) {
                    break;
                }

            case keys.BACKSPACE:
                setTimeout(proxy(this.search, this), 300); // TODO better approach
                return;
            default:
                return;
            }
        }
        else {
            switch(event.keyCode) {
            // 1. Ctrl-P -> calls function ShowAutocompleteAtLocation(x,y,partial_term) -> div is displayed at that location in the doc, with some random content
            case 80: // 'p'
                if(event.hashId == keys.KEY_MODS.ctrl) {
                    this.search();
                    break;
                }
                return;
            default:
                return;
            }
        }
        // 3. a way to prevent ace from receiving them
        event.preventDefault();
        event.stopPropagation();
    };

    this.myTextInput = function(event) {
        console.log("textInput", "text", event.text, "pasted", event.pasted);
        if(this.isActive) {
            this.search();
        }
    };

    this.myShow = function(x, y, res) {
        var bottom = this.bottomCoords();
        console.log(x,y,bottom);
        // TODO: do not hard code 130. get max-height param from autocomplete_outer
        showListAtLocation(y, x, res, null, proxy(this.complete, this), y > (bottom - 130));
        this.prevX = x;
        this.prevY = y;
    };

    this.myUpdate = function(res) {
        this.myShow(this.prevX, this.prevY, res);
    };

}).call(Autocomplete.prototype);


/**
 * Defaults
 */
Autocomplete.defaults = {
    /**
     * options.source(term, responseCallback)
     * FIXME
     * - term (String): the content up to the cursor;
     * - responseCallback (function(res)): callback function;
     *   - res is an array of objects (maps), containing two required
     *     properties:
     *     - A label property to display in the autocomplete list ("John Doe
     *       <john@doe.com>");
     *     - A value property that ends up in the input field once selected
     *       ("john@doe.com"). If undefined, same as label;
     */
    source: function(term, responseCallback) {
    }
};

});
