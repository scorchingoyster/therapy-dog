'use strict';

const Xmlbuilder = require('xmlbuilder');

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

class XMLAttribute {
  constructor(name, children, keep) {
    this.name = name;
    this.children = children;
    this.keep = keep;
  }

  render(builder) {
    let value = "";

    this.children.forEach(function(child) {
      value += String(child);
    });

    builder.attribute(this.name, value);
  }
}

exports.XMLAttribute = XMLAttribute;

class XMLElement {
  constructor(name, attributes, children, keep) {
    this.name = name;
    this.attributes = attributes;
    this.children = children;
    this.keep = keep;
  }

  render(builder) {
    let element = builder.element(this.name);
    renderElement(element, this.attributes, this.children);
  }
}

exports.XMLElement = XMLElement;

class XMLDocument {
  constructor(root) {
    this.root = root;
  }

  render(builder) {
    if (typeof builder === 'undefined') {
      builder = Xmlbuilder.create(this.root.name);
      renderElement(builder, this.root.attributes, this.root.children);
      return builder.doc();
    } else {
      let element = builder.element(this.root.name);
      renderElement(element, this.root.attributes, this.root.children);
    }
  }
}

exports.XMLDocument = XMLDocument;
