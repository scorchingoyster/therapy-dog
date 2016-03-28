'use strict';

var Xmlbuilder = require('xmlbuilder');

function renderElement(builder, attributes, children) {
  Object.keys(attributes).forEach(function(name) {
    builder.attribute(name, attributes[name]);
  });
  
  children.forEach(function(child) {
    if (child instanceof XMLElement || child instanceof XMLAttribute) {
      child.render(builder);
    } else {
      builder.text(String(child));
    }
  });
}

function XMLAttribute(name, children, keep) {
  this.name = name;
  this.children = children;
  this.keep = keep;
}

XMLAttribute.prototype.render = function(builder) {
  var value = "";
  
  this.children.forEach(function(child) {
    value += String(child);
  });
  
  builder.attribute(this.name, value);
};

module.exports.XMLAttribute = XMLAttribute;

function XMLElement(name, attributes, children, keep) {
  this.name = name;
  this.attributes = attributes;
  this.children = children;
  this.keep = keep;
}

XMLElement.prototype.render = function(builder) {
  var element = builder.element(this.name);
  renderElement(element, this.attributes, this.children);
};

module.exports.XMLElement = XMLElement;

function XMLDocument(root) {
  this.root = root;
}

XMLDocument.prototype.render = function(builder) {
  if (typeof builder === 'undefined') {
    builder = Xmlbuilder.create(this.root.name);
    renderElement(builder, this.root.attributes, this.root.children);
    return builder.doc();
  } else {
    var element = builder.element(this.root.name);
    renderElement(element, this.root.attributes, this.root.children);
  }
};

module.exports.XMLDocument = XMLDocument;
