/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule CSSPropertyOperations
 * @typechecks static-only
 */

"use strict";

var CSSProperty = require('CSSProperty');

var dangerousStyleValue = require('dangerousStyleValue');
var escapeTextForBrowser = require('escapeTextForBrowser');
var hyphenateStyleName = require('hyphenateStyleName');
var memoizeStringOnly = require('memoizeStringOnly');

var processStyleName = memoizeStringOnly(function(styleName) {
  return escapeTextForBrowser(hyphenateStyleName(styleName));
});

function removeStyleValue(node, styleName) {
  var expansion = CSSProperty.shorthandPropertyExpansions[styleName];
  var style = node.style;
  if (expansion) {
    // Shorthand property that IE8 won't like unsetting, so unset each
    // component to placate it
    for (var individualStyleName in expansion) {
      style[individualStyleName] = '';
    }
  } else {
    style[styleName] = '';
  }
}

/**
 * Operations for dealing with CSS properties.
 */
var CSSPropertyOperations = {

  /**
   * Serializes a mapping of style properties for use as inline styles:
   *
   *   > createMarkupForStyles({width: '200px', height: 0})
   *   "width:200px;height:0;"
   *
   * Undefined values are ignored so that declarative programming is easier.
   *
   * @param {object} styles
   * @return {?string}
   */
  createMarkupForStyles: function(styles) {
    var serialized = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (styleValue != null) {
        serialized += processStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue) + ';';
      }
    }
    return serialized || null;
  },

  setNodeStyleValue: function(node, styleName, styleValue) {
    var style = node.style;
    var processedStyleValue = dangerousStyleValue(styleName, styleValue);
    if (processedStyleValue) {
      style[styleName] = processedStyleValue;
    } else {
      removeStyleValue(node, styleName);
    }
  },

  wipeStyleValues: function(node, styles) {
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      removeStyleValue(node, styleName);
    }
  },

  setAllStyleValues: function(node, styles) {
    var style = node.style;
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = dangerousStyleValue(styleName, styles[styleName]);
      style[styleName] = styleValue;
    }
  }
};

module.exports = CSSPropertyOperations;
