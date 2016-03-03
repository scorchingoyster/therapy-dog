'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Xmlbuilder = _interopDefault(require('xmlbuilder'));

function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }


var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

babelHelpers;

var Context = function () {
  function Context(data) {
    babelHelpers.classCallCheck(this, Context);

    if (data) {
      this.frames = [Object.keys(data).reduce(function (frame, key) {
        frame[key] = { value: data[key], data: true };
        return frame;
      }, {})];
    } else {
      this.frames = [];
    }
  }

  babelHelpers.createClass(Context, [{
    key: "get",
    value: function get(name) {
      var path = Array.isArray(name) ? name : [name];

      for (var f = this.frames.length - 1; f >= 0; f--) {
        var value = undefined;

        if (this.frames[f].hasOwnProperty(path[0])) {
          value = this.frames[f][path[0]];
        } else {
          continue;
        }

        if (value.data) {
          var data = value.value;

          for (var i = 1; i < path.length; i++) {
            if (data.hasOwnProperty(path[i])) {
              data = data[path[i]];
            } else {
              data = undefined;
              break;
            }
          }

          return { value: data, data: true };
        } else {
          return value;
        }
      }

      return { value: undefined, data: false };
    }
  }, {
    key: "concat",
    value: function concat(values) {
      var context = new Context();
      context.frames = this.frames.concat(values);
      return context;
    }
  }]);
  return Context;
}();

function buildProgram(body) {
  return {
    type: "program",
    body: body || []
  };
}

function buildString(value) {
  return {
    type: "string",
    value: value
  };
}

function buildBoolean(value) {
  return {
    type: "boolean",
    value: value
  };
}

function buildNumber(value) {
  return {
    type: "number",
    value: value
  };
}

function buildHash(pairs) {
  return {
    type: "hash",
    pairs: pairs || []
  };
}

function buildPair(key, value) {
  return {
    type: "pair",
    key: key,
    value: value
  };
}

function buildCall(name, params, hash, locals, body, inverse) {
  return {
    type: "call",
    name: name,
    params: params || [],
    hash: hash || buildHash(),
    locals: locals || [],
    body: body || null,
    inverse: inverse || null
  };
}

function buildPath(parts) {
  return {
    type: "path",
    parts: parts || []
  };
}

function buildArrow(source, target) {
  return {
    type: "arrow",
    source: source,
    target: target || []
  };
}

function buildPartial(name, context) {
  return {
    type: "partial",
    name: name,
    context: context || buildHash()
  };
}

var require$$0 = {
  program: buildProgram,
  string: buildString,
  boolean: buildBoolean,
  number: buildNumber,
  hash: buildHash,
  pair: buildPair,
  call: buildCall,
  path: buildPath,
  arrow: buildArrow,
  partial: buildPartial
};

var parser = __commonjs(function (module) {
  module.exports = function () {
    "use strict";

    /*
     * Generated by PEG.js 0.9.0.
     *
     * http://pegjs.org/
     */

    function peg$subclass(child, parent) {
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
    }

    function peg$SyntaxError(message, expected, found, location) {
      this.message = message;
      this.expected = expected;
      this.found = found;
      this.location = location;
      this.name = "SyntaxError";

      if (typeof Error.captureStackTrace === "function") {
        Error.captureStackTrace(this, peg$SyntaxError);
      }
    }

    peg$subclass(peg$SyntaxError, Error);

    function peg$parse(input) {
      var options = arguments.length > 1 ? arguments[1] : {},
          parser = this,
          peg$FAILED = {},
          peg$startRuleFunctions = { Program: peg$parseProgram },
          peg$startRuleFunction = peg$parseProgram,
          peg$c0 = function peg$c0(stmt) {
        return stmt;
      },
          peg$c1 = ";",
          peg$c2 = { type: "literal", value: ";", description: "\";\"" },
          peg$c3 = function peg$c3() {
        return undefined;
      },
          peg$c4 = function peg$c4(body) {
        return b.program(body.filter(function (s) {
          return typeof s !== 'undefined';
        }));
      },
          peg$c5 = function peg$c5(expr) {
        return expr;
      },
          peg$c6 = "(",
          peg$c7 = { type: "literal", value: "(", description: "\"(\"" },
          peg$c8 = ")",
          peg$c9 = { type: "literal", value: ")", description: "\")\"" },
          peg$c10 = function peg$c10(source, target) {
        return b.arrow(source, target);
      },
          peg$c11 = function peg$c11(target) {
        return [target];
      },
          peg$c12 = function peg$c12(target) {
        return target;
      },
          peg$c13 = function peg$c13(head) {
        return head;
      },
          peg$c14 = function peg$c14(head, body) {
        return b.call(head.name, head.params, head.hash, body.locals, body.body, body.inverse);
      },
          peg$c15 = function peg$c15(name, param) {
        return param;
      },
          peg$c16 = function peg$c16(name, params, pair) {
        return pair;
      },
          peg$c17 = function peg$c17(name, params, pairs) {
        return b.call(name, params, b.hash(pairs));
      },
          peg$c18 = function peg$c18(locals, block) {
        return block;
      },
          peg$c19 = function peg$c19(locals, body, inverse) {
        return inverse;
      },
          peg$c20 = function peg$c20(locals, body, inverse) {
        return { locals: locals, body: body, inverse: inverse };
      },
          peg$c21 = function peg$c21(name) {
        return name;
      },
          peg$c22 = function peg$c22(locals) {
        return locals;
      },
          peg$c23 = function peg$c23(block) {
        return block;
      },
          peg$c24 = "=",
          peg$c25 = { type: "literal", value: "=", description: "\"=\"" },
          peg$c26 = function peg$c26(name) {
        return b.call(name);
      },
          peg$c27 = function peg$c27(key, value) {
        return b.pair(key, value);
      },
          peg$c28 = "{",
          peg$c29 = { type: "literal", value: "{", description: "\"{\"" },
          peg$c30 = "}",
          peg$c31 = { type: "literal", value: "}", description: "\"}\"" },
          peg$c32 = function peg$c32(program) {
        return program;
      },
          peg$c33 = function peg$c33(head, part) {
        return part;
      },
          peg$c34 = function peg$c34(head, tail) {
        return b.path([head].concat(tail));
      },
          peg$c35 = "`",
          peg$c36 = { type: "literal", value: "`", description: "\"`\"" },
          peg$c37 = function peg$c37(chars) {
        return chars.join("");
      },
          peg$c38 = "\\",
          peg$c39 = { type: "literal", value: "\\", description: "\"\\\\\"" },
          peg$c40 = { type: "any", description: "any character" },
          peg$c41 = function peg$c41() {
        return text();
      },
          peg$c42 = function peg$c42(sequence) {
        return sequence;
      },
          peg$c43 = function peg$c43(name, pair) {
        return pair;
      },
          peg$c44 = function peg$c44(name, pairs) {
        return b.partial(name, b.hash(pairs));
      },
          peg$c45 = function peg$c45(value) {
        return b.number(value);
      },
          peg$c46 = function peg$c46(value) {
        return b.boolean(value);
      },
          peg$c47 = function peg$c47(value) {
        return b.string(value);
      },
          peg$c48 = "-",
          peg$c49 = { type: "literal", value: "-", description: "\"-\"" },
          peg$c50 = /^[0-9]/,
          peg$c51 = { type: "class", value: "[0-9]", description: "[0-9]" },
          peg$c52 = ".",
          peg$c53 = { type: "literal", value: ".", description: "\".\"" },
          peg$c54 = function peg$c54() {
        return Number(text());
      },
          peg$c55 = "true",
          peg$c56 = { type: "literal", value: "true", description: "\"true\"" },
          peg$c57 = function peg$c57() {
        return true;
      },
          peg$c58 = "false",
          peg$c59 = { type: "literal", value: "false", description: "\"false\"" },
          peg$c60 = function peg$c60() {
        return false;
      },
          peg$c61 = "\"",
          peg$c62 = { type: "literal", value: "\"", description: "\"\\\"\"" },
          peg$c63 = "'",
          peg$c64 = { type: "literal", value: "'", description: "\"'\"" },
          peg$c65 = "n",
          peg$c66 = { type: "literal", value: "n", description: "\"n\"" },
          peg$c67 = function peg$c67() {
        return "\n";
      },
          peg$c68 = "r",
          peg$c69 = { type: "literal", value: "r", description: "\"r\"" },
          peg$c70 = function peg$c70() {
        return "\r";
      },
          peg$c71 = "as",
          peg$c72 = { type: "literal", value: "as", description: "\"as\"" },
          peg$c73 = "|",
          peg$c74 = { type: "literal", value: "|", description: "\"|\"" },
          peg$c75 = "else",
          peg$c76 = { type: "literal", value: "else", description: "\"else\"" },
          peg$c77 = "partial",
          peg$c78 = { type: "literal", value: "partial", description: "\"partial\"" },
          peg$c79 = "->",
          peg$c80 = { type: "literal", value: "->", description: "\"->\"" },
          peg$c81 = { type: "other", description: "identifier" },
          peg$c82 = /^[\-:@-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF\u1E00-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44\uFE47-\uFFFD]/,
          peg$c83 = { type: "class", value: "[\\-:@-Z_a-z\\xA8\\xAA\\xAD\\xAF\\xB2-\\xB5\\xB7-\\xBA\\xBC-\\xBE\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02FF\\u0370-\\u167F\\u1681-\\u180D\\u180F-\\u1DBF\\u1E00-\\u1FFF\\u200B-\\u200D\\u202A-\\u202E\\u203F\\u2040\\u2054\\u2060-\\u20CF\\u2100-\\u218F\\u2460-\\u24FF\\u2776-\\u2793\\u2C00-\\u2DFF\\u2E80-\\u2FFF\\u3004-\\u3007\\u3021-\\u302F\\u3031-\\uD7FF\\uF900-\\uFD3D\\uFD40-\\uFDCF\\uFDF0-\\uFE1F\\uFE30-\\uFE44\\uFE47-\\uFFFD]", description: "[\\-:@-Z_a-z\\xA8\\xAA\\xAD\\xAF\\xB2-\\xB5\\xB7-\\xBA\\xBC-\\xBE\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u02FF\\u0370-\\u167F\\u1681-\\u180D\\u180F-\\u1DBF\\u1E00-\\u1FFF\\u200B-\\u200D\\u202A-\\u202E\\u203F\\u2040\\u2054\\u2060-\\u20CF\\u2100-\\u218F\\u2460-\\u24FF\\u2776-\\u2793\\u2C00-\\u2DFF\\u2E80-\\u2FFF\\u3004-\\u3007\\u3021-\\u302F\\u3031-\\uD7FF\\uF900-\\uFD3D\\uFD40-\\uFDCF\\uFDF0-\\uFE1F\\uFE30-\\uFE44\\uFE47-\\uFFFD]" },
          peg$c84 = /^[\uD800-\uD83E\uD840-\uD87E\uD880-\uD8BE\uD8C0-\uD8FE\uD900-\uD93E\uD940-\uD97E\uD980-\uD9BE\uD9C0-\uD9FE\uDA00-\uDA3E\uDA40-\uDA7E\uDA80-\uDABE\uDAC0-\uDAFE\uDB00-\uDB3E\uDB40-\uDB7E]/,
          peg$c85 = { type: "class", value: "[\\uD800-\\uD83E\\uD840-\\uD87E\\uD880-\\uD8BE\\uD8C0-\\uD8FE\\uD900-\\uD93E\\uD940-\\uD97E\\uD980-\\uD9BE\\uD9C0-\\uD9FE\\uDA00-\\uDA3E\\uDA40-\\uDA7E\\uDA80-\\uDABE\\uDAC0-\\uDAFE\\uDB00-\\uDB3E\\uDB40-\\uDB7E]", description: "[\\uD800-\\uD83E\\uD840-\\uD87E\\uD880-\\uD8BE\\uD8C0-\\uD8FE\\uD900-\\uD93E\\uD940-\\uD97E\\uD980-\\uD9BE\\uD9C0-\\uD9FE\\uDA00-\\uDA3E\\uDA40-\\uDA7E\\uDA80-\\uDABE\\uDAC0-\\uDAFE\\uDB00-\\uDB3E\\uDB40-\\uDB7E]" },
          peg$c86 = /^[\uDC00-\uDFFF]/,
          peg$c87 = { type: "class", value: "[\\uDC00-\\uDFFF]", description: "[\\uDC00-\\uDFFF]" },
          peg$c88 = /^[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F]/,
          peg$c89 = { type: "class", value: "[\\uD83F\\uD87F\\uD8BF\\uD8FF\\uD93F\\uD97F\\uD9BF\\uD9FF\\uDA3F\\uDA7F\\uDABF\\uDAFF\\uDB3F\\uDB7F]", description: "[\\uD83F\\uD87F\\uD8BF\\uD8FF\\uD93F\\uD97F\\uD9BF\\uD9FF\\uDA3F\\uDA7F\\uDABF\\uDAFF\\uDB3F\\uDB7F]" },
          peg$c90 = /^[\uDC00-\uDFFD]/,
          peg$c91 = { type: "class", value: "[\\uDC00-\\uDFFD]", description: "[\\uDC00-\\uDFFD]" },
          peg$c92 = /^[\-0-:A-Z_a-z\xA8\xAA\xAD\xAF\xB2-\xB5\xB7-\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u167F\u1681-\u180D\u180F-\u1FFF\u200B-\u200D\u202A-\u202E\u203F\u2040\u2054\u2060-\u218F\u2460-\u24FF\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007\u3021-\u302F\u3031-\uD7FF\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE44\uFE47-\uFFFD]/,
          peg$c93 = { type: "class", value: "[\\-0-:A-Z_a-z\\xA8\\xAA\\xAD\\xAF\\xB2-\\xB5\\xB7-\\xBA\\xBC-\\xBE\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u167F\\u1681-\\u180D\\u180F-\\u1FFF\\u200B-\\u200D\\u202A-\\u202E\\u203F\\u2040\\u2054\\u2060-\\u218F\\u2460-\\u24FF\\u2776-\\u2793\\u2C00-\\u2DFF\\u2E80-\\u2FFF\\u3004-\\u3007\\u3021-\\u302F\\u3031-\\uD7FF\\uF900-\\uFD3D\\uFD40-\\uFDCF\\uFDF0-\\uFE44\\uFE47-\\uFFFD]", description: "[\\-0-:A-Z_a-z\\xA8\\xAA\\xAD\\xAF\\xB2-\\xB5\\xB7-\\xBA\\xBC-\\xBE\\xC0-\\xD6\\xD8-\\xF6\\xF8-\\u167F\\u1681-\\u180D\\u180F-\\u1FFF\\u200B-\\u200D\\u202A-\\u202E\\u203F\\u2040\\u2054\\u2060-\\u218F\\u2460-\\u24FF\\u2776-\\u2793\\u2C00-\\u2DFF\\u2E80-\\u2FFF\\u3004-\\u3007\\u3021-\\u302F\\u3031-\\uD7FF\\uF900-\\uFD3D\\uFD40-\\uFDCF\\uFDF0-\\uFE44\\uFE47-\\uFFFD]" },
          peg$c94 = "#",
          peg$c95 = { type: "literal", value: "#", description: "\"#\"" },
          peg$c96 = " ",
          peg$c97 = { type: "literal", value: " ", description: "\" \"" },
          peg$c98 = "\n",
          peg$c99 = { type: "literal", value: "\n", description: "\"\\n\"" },
          peg$currPos = 0,
          peg$savedPos = 0,
          peg$posDetailsCache = [{ line: 1, column: 1, seenCR: false }],
          peg$maxFailPos = 0,
          peg$maxFailExpected = [],
          peg$silentFails = 0,
          peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function text() {
        return input.substring(peg$savedPos, peg$currPos);
      }

      function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
      }

      function expected(description) {
        throw peg$buildException(null, [{ type: "other", description: description }], input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
      }

      function error(message) {
        throw peg$buildException(message, null, input.substring(peg$savedPos, peg$currPos), peg$computeLocation(peg$savedPos, peg$currPos));
      }

      function peg$computePosDetails(pos) {
        var details = peg$posDetailsCache[pos],
            p,
            ch;

        if (details) {
          return details;
        } else {
          p = pos - 1;
          while (!peg$posDetailsCache[p]) {
            p--;
          }

          details = peg$posDetailsCache[p];
          details = {
            line: details.line,
            column: details.column,
            seenCR: details.seenCR
          };

          while (p < pos) {
            ch = input.charAt(p);
            if (ch === "\n") {
              if (!details.seenCR) {
                details.line++;
              }
              details.column = 1;
              details.seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              details.line++;
              details.column = 1;
              details.seenCR = true;
            } else {
              details.column++;
              details.seenCR = false;
            }

            p++;
          }

          peg$posDetailsCache[pos] = details;
          return details;
        }
      }

      function peg$computeLocation(startPos, endPos) {
        var startPosDetails = peg$computePosDetails(startPos),
            endPosDetails = peg$computePosDetails(endPos);

        return {
          start: {
            offset: startPos,
            line: startPosDetails.line,
            column: startPosDetails.column
          },
          end: {
            offset: endPos,
            line: endPosDetails.line,
            column: endPosDetails.column
          }
        };
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
          return;
        }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildException(message, expected, found, location) {
        function cleanupExpected(expected) {
          var i = 1;

          expected.sort(function (a, b) {
            if (a.description < b.description) {
              return -1;
            } else if (a.description > b.description) {
              return 1;
            } else {
              return 0;
            }
          });

          while (i < expected.length) {
            if (expected[i - 1] === expected[i]) {
              expected.splice(i, 1);
            } else {
              i++;
            }
          }
        }

        function buildMessage(expected, found) {
          function stringEscape(s) {
            function hex(ch) {
              return ch.charCodeAt(0).toString(16).toUpperCase();
            }

            return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
              return '\\x0' + hex(ch);
            }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
              return '\\x' + hex(ch);
            }).replace(/[\u0100-\u0FFF]/g, function (ch) {
              return "\\u0" + hex(ch);
            }).replace(/[\u1000-\uFFFF]/g, function (ch) {
              return "\\u" + hex(ch);
            });
          }

          var expectedDescs = new Array(expected.length),
              expectedDesc,
              foundDesc,
              i;

          for (i = 0; i < expected.length; i++) {
            expectedDescs[i] = expected[i].description;
          }

          expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];

          foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

          return "Expected " + expectedDesc + " but " + foundDesc + " found.";
        }

        if (expected !== null) {
          cleanupExpected(expected);
        }

        return new peg$SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, location);
      }

      function peg$parseProgram() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parse__();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parseStatement();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s3;
              s4 = peg$c0(s4);
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 59) {
              s4 = peg$c1;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c2);
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c3();
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parseStatement();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c0(s4);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              s3 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 59) {
                s4 = peg$c1;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c2);
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse__();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s3;
                  s4 = peg$c3();
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c4(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseStatement() {
        var s0, s1, s2;

        s0 = peg$parseCallWithBlock();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseCallWithoutBlock();
          if (s1 === peg$FAILED) {
            s1 = peg$parseArrow();
            if (s1 === peg$FAILED) {
              s1 = peg$parsePath();
              if (s1 === peg$FAILED) {
                s1 = peg$parsePartial();
                if (s1 === peg$FAILED) {
                  s1 = peg$parseLiteral();
                  if (s1 === peg$FAILED) {
                    s1 = peg$parseSubexpression();
                  }
                }
              }
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEOS();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c5(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseExpression() {
        var s0;

        s0 = peg$parseCallWithBlock();
        if (s0 === peg$FAILED) {
          s0 = peg$parseCallWithoutBlock();
          if (s0 === peg$FAILED) {
            s0 = peg$parseArrow();
            if (s0 === peg$FAILED) {
              s0 = peg$parsePath();
              if (s0 === peg$FAILED) {
                s0 = peg$parsePartial();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseLiteral();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseSubexpression();
                  }
                }
              }
            }
          }
        }

        return s0;
      }

      function peg$parseSubexpression() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 40) {
          s1 = peg$c6;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c7);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseExpression();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 41) {
                  s5 = peg$c8;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c9);
                  }
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c5(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseArrow() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseArrowSource();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseArrowToken();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseArrowTarget();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c10(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseArrowSource() {
        var s0;

        s0 = peg$parseCallHead();
        if (s0 === peg$FAILED) {
          s0 = peg$parsePath();
          if (s0 === peg$FAILED) {
            s0 = peg$parsePartial();
            if (s0 === peg$FAILED) {
              s0 = peg$parseLiteral();
              if (s0 === peg$FAILED) {
                s0 = peg$parseSubexpression();
              }
            }
          }
        }

        return s0;
      }

      function peg$parseArrowTarget() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        s1 = peg$parseCallHead();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c11(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = [];
          s1 = peg$currPos;
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 40) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c7);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseCallHead();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 41) {
                      s7 = peg$c8;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$c9);
                      }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$savedPos = s1;
                      s2 = peg$c12(s5);
                      s1 = s2;
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$currPos;
            s2 = peg$parse_();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 40) {
                s3 = peg$c6;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c7);
                }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parseCallHead();
                  if (s5 !== peg$FAILED) {
                    s6 = peg$parse_();
                    if (s6 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s7 = peg$c8;
                        peg$currPos++;
                      } else {
                        s7 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$c9);
                        }
                      }
                      if (s7 !== peg$FAILED) {
                        peg$savedPos = s1;
                        s2 = peg$c12(s5);
                        s1 = s2;
                      } else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$FAILED;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$FAILED;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          }
        }

        return s0;
      }

      function peg$parseCallWithoutBlock() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$parseCallHead();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            s4 = peg$parseArrowToken();
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = void 0;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c13(s1);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseCallWithBlock() {
        var s0, s1, s2, s3, s4;

        s0 = peg$currPos;
        s1 = peg$parseCallHead();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            s4 = peg$parseArrowToken();
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = void 0;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseCallBody();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c14(s1, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseCallHead() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$parsePathSeparator();
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = void 0;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseParam();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s4;
                s5 = peg$c15(s1, s6);
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$currPos;
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseParam();
                if (s6 !== peg$FAILED) {
                  peg$savedPos = s4;
                  s5 = peg$c15(s1, s6);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$currPos;
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsePair();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s5;
                  s6 = peg$c16(s1, s3, s7);
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsePair();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s5;
                    s6 = peg$c16(s1, s3, s7);
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              }
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c17(s1, s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseCallBody() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseCallLocals();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseBlock();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s2;
              s3 = peg$c18(s1, s4);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseCallInverse();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c19(s1, s2, s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c20(s1, s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseCallLocals() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        s1 = peg$parseLocalsBegin();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$currPos;
            s5 = peg$parseIdentifier();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                peg$savedPos = s4;
                s5 = peg$c21(s5);
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$currPos;
                s5 = peg$parseIdentifier();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (s6 !== peg$FAILED) {
                    peg$savedPos = s4;
                    s5 = peg$c21(s5);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
              }
            } else {
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseLocalsEnd();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c22(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseCallInverse() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseElseToken();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseCallHead();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseCallBody();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c14(s3, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseElseToken();
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            if (s2 !== peg$FAILED) {
              s3 = peg$parseBlock();
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c23(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseParam() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s5 = peg$c24;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c25);
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$currPos;
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsePathSeparator();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = void 0;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c26(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseLiteral();
          if (s0 === peg$FAILED) {
            s0 = peg$parseSubexpression();
          }
        }

        return s0;
      }

      function peg$parsePair() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseKey();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c24;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c25);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              if (s4 !== peg$FAILED) {
                s5 = peg$parseParam();
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c27(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseKey() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s5 = peg$c24;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c25);
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          peg$silentFails--;
          if (s3 !== peg$FAILED) {
            peg$currPos = s2;
            s2 = void 0;
          } else {
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c21(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseBlock() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c28;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c29);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseProgram();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s3 = peg$c30;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c31);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c32(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parsePath() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        s1 = peg$parsePathPart();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parsePathSeparator();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsePathPart();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s3;
              s4 = peg$c33(s1, s5);
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parsePathSeparator();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsePathPart();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s3;
                s4 = peg$c33(s1, s5);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c34(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parsePathPart() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 96) {
          s1 = peg$c35;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c36);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parsePathPartCharacter();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parsePathPartCharacter();
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 96) {
              s3 = peg$c35;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c36);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c37(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseIdentifier();
        }

        return s0;
      }

      function peg$parsePathPartCharacter() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 96) {
          s2 = peg$c35;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c36);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 92) {
            s2 = peg$c38;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$parseLineTerminator();
          }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c40);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c41();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c38;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseCharacterEscapeSequence();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c42(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parsePartial() {
        var s0, s1, s2, s3, s4, s5, s6, s7;

        s0 = peg$currPos;
        s1 = peg$parsePartialToken();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseParam();
            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$currPos;
              s6 = peg$parse_();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsePair();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s5;
                  s6 = peg$c43(s3, s7);
                  s5 = s6;
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$currPos;
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsePair();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s5;
                    s6 = peg$c43(s3, s7);
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$FAILED;
                }
              }
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c44(s3, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseLiteral() {
        var s0, s1;

        s0 = peg$currPos;
        s1 = peg$parseNumber();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c45(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseBoolean();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c46(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseString();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c47(s1);
            }
            s0 = s1;
          }
        }

        return s0;
      }

      function peg$parseNumber() {
        var s0, s1, s2, s3, s4, s5, s6;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c48;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c49);
          }
        }
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          if (peg$c50.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c51);
            }
          }
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              if (peg$c50.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c51);
                }
              }
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c52;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c53);
              }
            }
            if (s4 !== peg$FAILED) {
              s5 = [];
              if (peg$c50.test(input.charAt(peg$currPos))) {
                s6 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c51);
                }
              }
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  if (peg$c50.test(input.charAt(peg$currPos))) {
                    s6 = input.charAt(peg$currPos);
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c51);
                    }
                  }
                }
              } else {
                s5 = peg$FAILED;
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 === peg$FAILED) {
              s3 = null;
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c54();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseBoolean() {
        var s0, s1;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c55) {
          s1 = peg$c55;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c56);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c57();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 5) === peg$c58) {
            s1 = peg$c58;
            peg$currPos += 5;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c59);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c60();
          }
          s0 = s1;
        }

        return s0;
      }

      function peg$parseString() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c61;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c62);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDoubleStringCharacter();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDoubleStringCharacter();
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s3 = peg$c61;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c62);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c37(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s1 = peg$c63;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c64);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseSingleStringCharacter();
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseSingleStringCharacter();
            }
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 39) {
                s3 = peg$c63;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c64);
                }
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c37(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseDoubleStringCharacter() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 34) {
          s2 = peg$c61;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c62);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 92) {
            s2 = peg$c38;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$parseLineTerminator();
          }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c40);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c41();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c38;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseCharacterEscapeSequence();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c42(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseSingleStringCharacter() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c63;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c64);
          }
        }
        if (s2 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 92) {
            s2 = peg$c38;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = peg$parseLineTerminator();
          }
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c40);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c41();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c38;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseCharacterEscapeSequence();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c42(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }

        return s0;
      }

      function peg$parseCharacterEscapeSequence() {
        var s0;

        s0 = peg$parseSingleEscapeCharacter();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNonEscapeCharacter();
        }

        return s0;
      }

      function peg$parseSingleEscapeCharacter() {
        var s0, s1;

        if (input.charCodeAt(peg$currPos) === 39) {
          s0 = peg$c63;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c64);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s0 = peg$c61;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c62);
            }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 96) {
              s0 = peg$c35;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c36);
              }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 92) {
                s0 = peg$c38;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c39);
                }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 110) {
                  s1 = peg$c65;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$c66);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c67();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 114) {
                    s1 = peg$c68;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$c69);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c70();
                  }
                  s0 = s1;
                }
              }
            }
          }
        }

        return s0;
      }

      function peg$parseNonEscapeCharacter() {
        var s0, s1, s2;

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseSingleEscapeCharacter();
        if (s2 === peg$FAILED) {
          s2 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c40);
            }
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c41();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseLocalsBegin() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c71) {
          s1 = peg$c71;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c72);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 124) {
              s3 = peg$c73;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c74);
              }
            }
            if (s3 !== peg$FAILED) {
              s1 = [s1, s2, s3];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseLocalsEnd() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 124) {
          s0 = peg$c73;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c74);
          }
        }

        return s0;
      }

      function peg$parseElseToken() {
        var s0;

        if (input.substr(peg$currPos, 4) === peg$c75) {
          s0 = peg$c75;
          peg$currPos += 4;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c76);
          }
        }

        return s0;
      }

      function peg$parsePartialToken() {
        var s0;

        if (input.substr(peg$currPos, 7) === peg$c77) {
          s0 = peg$c77;
          peg$currPos += 7;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c78);
          }
        }

        return s0;
      }

      function peg$parseArrowToken() {
        var s0;

        if (input.substr(peg$currPos, 2) === peg$c79) {
          s0 = peg$c79;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c80);
          }
        }

        return s0;
      }

      function peg$parsePathSeparator() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 46) {
          s0 = peg$c52;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c53);
          }
        }

        return s0;
      }

      function peg$parseReservedWord() {
        var s0;

        s0 = peg$parseBoolean();
        if (s0 === peg$FAILED) {
          s0 = peg$parseElseToken();
          if (s0 === peg$FAILED) {
            s0 = peg$parsePartialToken();
            if (s0 === peg$FAILED) {
              s0 = peg$parseArrowToken();
              if (s0 === peg$FAILED) {
                s0 = peg$parseLocalsBegin();
              }
            }
          }
        }

        return s0;
      }

      function peg$parseIdentifier() {
        var s0, s1, s2, s3, s4;

        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseReservedWord();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = void 0;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseIdentifierHead();
          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseIdentifierTail();
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseIdentifierTail();
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c41();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c81);
          }
        }

        return s0;
      }

      function peg$parseIdentifierHead() {
        var s0, s1, s2;

        if (peg$c82.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c83);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (peg$c84.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c85);
            }
          }
          if (s1 !== peg$FAILED) {
            if (peg$c86.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c87);
              }
            }
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (peg$c88.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c89);
              }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c90.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c91);
                }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }

        return s0;
      }

      function peg$parseIdentifierTail() {
        var s0, s1, s2;

        if (peg$c92.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c93);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (peg$c84.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c85);
            }
          }
          if (s1 !== peg$FAILED) {
            if (peg$c86.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c87);
              }
            }
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (peg$c88.test(input.charAt(peg$currPos))) {
              s1 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c89);
              }
            }
            if (s1 !== peg$FAILED) {
              if (peg$c90.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c91);
                }
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }

        return s0;
      }

      function peg$parseComment() {
        var s0, s1, s2, s3, s4, s5;

        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 35) {
          s1 = peg$c94;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c95);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseLineTerminator();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$c40);
              }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseLineTerminator();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c40);
                }
              }
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      function peg$parseWhiteSpace() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 32) {
          s0 = peg$c96;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c97);
          }
        }

        return s0;
      }

      function peg$parseLineTerminator() {
        var s0;

        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c98;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c99);
          }
        }

        return s0;
      }

      function peg$parse__() {
        var s0, s1;

        s0 = [];
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseLineTerminator();
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment();
          }
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseWhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = peg$parseLineTerminator();
            if (s1 === peg$FAILED) {
              s1 = peg$parseComment();
            }
          }
        }

        return s0;
      }

      function peg$parse_() {
        var s0, s1;

        s0 = [];
        s1 = peg$parseWhiteSpace();
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseWhiteSpace();
        }

        return s0;
      }

      function peg$parseEOS() {
        var s0, s1, s2, s3;

        s0 = peg$currPos;
        s1 = peg$parse__();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 59) {
            s2 = peg$c1;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$c2);
            }
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          if (s1 !== peg$FAILED) {
            s2 = peg$parseComment();
            if (s2 === peg$FAILED) {
              s2 = null;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parseLineTerminator();
              if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse_();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              peg$silentFails++;
              if (input.charCodeAt(peg$currPos) === 125) {
                s3 = peg$c30;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$c31);
                }
              }
              peg$silentFails--;
              if (s3 !== peg$FAILED) {
                peg$currPos = s2;
                s2 = void 0;
              } else {
                s2 = peg$FAILED;
              }
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parse__();
              if (s1 !== peg$FAILED) {
                s2 = peg$parseEOF();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            }
          }
        }

        return s0;
      }

      function peg$parseEOF() {
        var s0, s1;

        s0 = peg$currPos;
        peg$silentFails++;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$c40);
          }
        }
        peg$silentFails--;
        if (s1 === peg$FAILED) {
          s0 = void 0;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }

        return s0;
      }

      var b = require$$0;

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail({ type: "end", description: "end of input" });
        }

        throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
      }
    }

    return {
      SyntaxError: peg$SyntaxError,
      parse: peg$parse
    };
  }();
});

parser && (typeof parser === "undefined" ? "undefined" : babelHelpers.typeof(parser)) === 'object' && 'default' in parser ? parser['default'] : parser;
var parse = parser.parse;

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function registerEach (arrow) {
  arrow.registerHelper('each', Arrow.helper(function (_ref, hash, body, inverse) {
    var _ref2 = babelHelpers.slicedToArray(_ref, 1);

    var items = _ref2[0];

    if (!isEmpty(items)) {
      if (Array.isArray(items)) {
        return items.reduce(function (result, item, index) {
          return result.concat(body(item, index));
        }, []);
      } else {
        return body(items, 0);
      }
    } else {
      return inverse();
    }
  }));
}

function registerIf (arrow) {
  arrow.registerHelper('if', Arrow.helper(function (_ref, hash, body, inverse) {
    var _ref2 = babelHelpers.slicedToArray(_ref, 1);

    var conditional = _ref2[0];

    if (!isEmpty(conditional)) {
      return body();
    } else {
      return inverse();
    }
  }));
}

function registerWith (arrow) {
  arrow.registerHelper('with', Arrow.helper(function (_ref, hash, body, inverse) {
    var _ref2 = babelHelpers.slicedToArray(_ref, 1);

    var value = _ref2[0];

    if (!isEmpty(value)) {
      return body(value);
    } else {
      return inverse();
    }
  }));
}

function registerDefaultHelpers(arrow) {
  registerEach(arrow);
  registerIf(arrow);
  registerWith(arrow);
}

function evaluateString(environment, context, node) {
  return { value: node.value, data: false };
}

function evaluateNumber(environment, context, node) {
  return { value: node.value, data: false };
}

function evaluateBoolean(environment, context, node) {
  return { value: node.value, data: false };
}

function blockEvaluator(block, locals, environment, context) {
  return function () {
    if (!block) {
      return { value: [], data: false };
    }

    var frame = {};
    for (var i = 0; i < locals.length && i < arguments.length; i++) {
      frame[locals[i]] = arguments[i];
    }

    return evaluateNode(environment, context.concat(frame), block);
  };
}

function evaluateCall(environment, context, node) {
  if (environment.helpers.hasOwnProperty(node.name)) {
    var helper = environment.helpers[node.name];

    var params = node.params.map(function (param) {
      return evaluateNode(environment, context, param);
    });

    var hash = node.hash.pairs.reduce(function (hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});

    var body = blockEvaluator(node.body, node.locals, environment, context);
    var inverse = blockEvaluator(node.inverse, node.locals, environment, context);

    return helper(params, hash, body, inverse);
  } else {
    return context.get(node.name);
  }
}

function evaluateProgram(environment, context, node) {
  var value = [];
  var data = false;

  node.body.forEach(function (child) {
    var results = evaluateNode(environment, context, child);

    if (typeof results.value !== 'undefined') {
      value = value.concat(results.value);
    }

    data = data || results.data;
  });

  return { value: value, data: data };
}

function evaluatePath(environment, context, node) {
  return context.get(node.parts);
}

function evaluatePartial(environment, context, node) {
  var name = evaluateNode(environment, context, node.name).value;

  if (!environment.partials.hasOwnProperty(name)) {
    return { value: undefined, data: false };
  }

  var template = environment.partials[name];

  if (node.context) {
    var frame = node.context.pairs.reduce(function (hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});

    context = context.concat(frame);
  }

  return evaluateNode(template.environment, context, template.program);
}

function evaluateArrow(environment, context, node) {
  var value = [];
  var data = false;

  var source = evaluateNode(environment, context, node.source);
  source.value = Array.isArray(source.value) ? source.value : [source.value];

  source.value.forEach(function (item) {
    if (isEmpty(item)) {
      return;
    }

    var body = { value: item, data: source.data };

    for (var i = node.target.length - 1; i >= 0; i--) {
      var target = node.target[i];

      if (!environment.helpers.hasOwnProperty(target.name)) {
        throw new Error('All of the parts of an arrow\'s target must be helpers.');
      }

      var helper = environment.helpers[target.name];

      var params = target.params.map(function (param) {
        return evaluateNode(environment, context, param);
      });

      var hash = target.hash.pairs.reduce(function (hash, pair) {
        hash[pair.key] = evaluateNode(environment, context, pair.value);
        return hash;
      }, {});

      // In order to mimic the result of evaluating a program node, wrap in an array.
      body.value = Array.isArray(body.value) ? body.value : [body.value];

      body = helper(params, hash, function () {
        return body;
      });
    }

    value = value.concat(body.value);
    data = data || body.data;
  });

  return { value: value, data: data };
}

function evaluateNode(environment, context, node) {
  var result = undefined;

  if (node.type === "string") {
    result = evaluateString(environment, context, node);
  } else if (node.type === "number") {
    result = evaluateNumber(environment, context, node);
  } else if (node.type === "boolean") {
    result = evaluateBoolean(environment, context, node);
  } else if (node.type === "call") {
    result = evaluateCall(environment, context, node);
  } else if (node.type === "program") {
    result = evaluateProgram(environment, context, node);
  } else if (node.type === "path") {
    result = evaluatePath(environment, context, node);
  } else if (node.type === "partial") {
    result = evaluatePartial(environment, context, node);
  } else if (node.type === "arrow") {
    result = evaluateArrow(environment, context, node);
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }

  return result;
}

function unwrappedEvaluator(block, isData) {
  return function () {
    if (!block) {
      return { value: [], data: false };
    }

    var wrappedArguments = [];
    for (var i = 0; i < arguments.length; i++) {
      wrappedArguments.push({ value: arguments[i], data: isData.params || isData.hash });
    }

    var result = block.apply(undefined, wrappedArguments);
    isData.blocks = isData.blocks || result.data;
    return result.value;
  };
}

function cookedHelper(func) {
  return function (params, hash, body, inverse) {
    var unwrappedParams = params.map(function (p) {
      return p.value;
    });
    var unwrappedHash = Object.keys(hash).reduce(function (h, k) {
      h[k] = hash[k].value;return h;
    }, {});

    var isData = {
      params: params.some(function (p) {
        return p.data;
      }),
      hash: Object.keys(hash).some(function (k) {
        return hash[k].data;
      }),
      blocks: false
    };

    var unwrappedBody = unwrappedEvaluator(body, isData);
    var unwrappedInverse = unwrappedEvaluator(inverse, isData);

    return {
      value: func(unwrappedParams, unwrappedHash, unwrappedBody, unwrappedInverse),
      data: isData.params || isData.hash || isData.blocks
    };
  };
}

function parseInput(input) {
  if (input.type === 'program') {
    return input;
  }

  return parse(input);
}

var Arrow = function () {
  function Arrow(input, documentHelpers) {
    var _this = this;

    babelHelpers.classCallCheck(this, Arrow);

    this.program = parseInput(input);

    this.environment = {
      helpers: {},
      partials: {}
    };

    registerDefaultHelpers(this);

    if (typeof documentHelpers !== 'undefined') {
      Object.keys(documentHelpers).forEach(function (name) {
        var helper = documentHelpers[name];

        if (name === 'document') {
          _this.registerDocumentHelper(helper);
        } else {
          _this.registerHelper(name, helper);
        }
      });
    }
  }

  babelHelpers.createClass(Arrow, [{
    key: 'registerDocumentHelper',
    value: function registerDocumentHelper(func) {
      this.environment.documentHelper = func;
    }
  }, {
    key: 'registerHelper',
    value: function registerHelper(name, func) {
      this.environment.helpers[name] = func;
    }
  }, {
    key: 'registerPartial',
    value: function registerPartial(name, template) {
      this.environment.partials[name] = template;
    }
  }, {
    key: 'evaluate',
    value: function evaluate(input) {
      var result = evaluateNode(this.environment, new Context(input), this.program);

      if (typeof this.environment.documentHelper !== 'undefined') {
        return this.environment.documentHelper([], {}, function () {
          return result;
        }).value;
      } else {
        return result.value;
      }
    }
  }]);
  return Arrow;
}();

Arrow.helper = function (func) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? { raw: false } : arguments[1];

  var raw = _ref.raw;

  return raw ? func : cookedHelper(func);
};

function renderElement(builder, attributes, children) {
  Object.keys(attributes).forEach(function (name) {
    builder.attribute(name, attributes[name]);
  });

  children.forEach(function (child) {
    if (child instanceof XMLElement || child instanceof XMLAttribute) {
      child.render(builder);
    } else {
      builder.text(String(child));
    }
  });
}

var XMLAttribute = function () {
  function XMLAttribute(name, children, keep) {
    babelHelpers.classCallCheck(this, XMLAttribute);

    this.name = name;
    this.children = children;
    this.keep = keep;
  }

  babelHelpers.createClass(XMLAttribute, [{
    key: 'render',
    value: function render(builder) {
      var value = "";

      this.children.forEach(function (child) {
        value += String(child);
      });

      builder.attribute(this.name, value);
    }
  }]);
  return XMLAttribute;
}();

var XMLElement = function () {
  function XMLElement(name, attributes, children, keep) {
    babelHelpers.classCallCheck(this, XMLElement);

    this.name = name;
    this.attributes = attributes;
    this.children = children;
    this.keep = keep;
  }

  babelHelpers.createClass(XMLElement, [{
    key: 'render',
    value: function render(builder) {
      var element = builder.element(this.name);
      renderElement(element, this.attributes, this.children);
    }
  }]);
  return XMLElement;
}();

var XMLDocument = function () {
  function XMLDocument(root) {
    babelHelpers.classCallCheck(this, XMLDocument);

    this.root = root;
  }

  babelHelpers.createClass(XMLDocument, [{
    key: 'render',
    value: function render(builder) {
      if (typeof builder === 'undefined') {
        var _builder = Xmlbuilder.create(this.root.name);
        renderElement(_builder, this.root.attributes, this.root.children);
        return _builder.doc();
      } else {
        var element = builder.element(this.root.name);
        renderElement(element, this.root.attributes, this.root.children);
      }
    }
  }]);
  return XMLDocument;
}();

function parseHash(hash) {
  var options = {};
  var attributes = {};
  var data = false;

  Object.keys(hash).forEach(function (key) {
    if (key[0] === "@") {
      options[key.slice(1)] = hash[key].value;
    } else {
      attributes[key] = hash[key].value;
    }

    data = data || hash[key].data;
  });

  return { attributes: attributes, options: options, data: data };
}

var xml = {
  attribute: Arrow.helper(function (_ref, hash, body) {
    var _ref2 = babelHelpers.slicedToArray(_ref, 1);

    var name = _ref2[0];

    var _parseHash = parseHash(hash);

    var options = _parseHash.options;
    var data = _parseHash.data;


    data = data || name.data;
    name = name.value;

    var children = body();
    data = data || children.data;

    if (options.compact) {
      children = children.value.filter(function (child) {
        return children.data;
      });
    } else {
      children = children.value;
    }

    var keep = undefined;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data;
    }

    return { value: new XMLAttribute(name, children, keep), data: data };
  }, { raw: true }),

  element: Arrow.helper(function (_ref3, hash, body) {
    var _ref4 = babelHelpers.slicedToArray(_ref3, 1);

    var name = _ref4[0];

    var _parseHash2 = parseHash(hash);

    var attributes = _parseHash2.attributes;
    var options = _parseHash2.options;
    var data = _parseHash2.data;


    data = data || name.data;
    name = name.value;

    var children = body();
    data = data || children.data;

    if (options.compact) {
      children = children.value.filter(function (child) {
        if (child instanceof XMLElement || child instanceof XMLAttribute) {
          return child.keep;
        } else {
          return children.data;
        }
      });
    } else {
      children = children.value;
    }

    var keep = undefined;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data || children.some(function (child) {
        return child.keep;
      });
    }

    return { value: new XMLElement(name, attributes, children, keep), data: data };
  }, { raw: true }),

  document: Arrow.helper(function (params, hash, body) {
    return new XMLDocument(body()[0]);
  })
};

module.exports = xml;
//# sourceMappingURL=xml.js.map