'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Xmlbuilder = _interopDefault(require('xmlbuilder'));

var babelHelpers = {};

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

babelHelpers;

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

exports.XMLAttribute = XMLAttribute;
exports.XMLElement = XMLElement;
exports.XMLDocument = XMLDocument;
//# sourceMappingURL=model.js.map