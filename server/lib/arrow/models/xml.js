'use strict';

const Xmlbuilder = require('xmlbuilder');

/**
  @module arrow
  @submodule arrow-models
*/

function renderElementStructure(node, parent) {
  let element = parent.element(node.type);

  Object.keys(node.properties).forEach(function(key) {
    element.attribute(key, node.properties[key]);
  });

  renderBody(node.children, element);
}

function renderAttributeStructure(node, parent) {
  let name = node.type.slice(1);

  let value;
  if (node.properties.value) {
    value = node.properties.value;
  } else {
    value = node.children.reduce(function(result, child) {
      return result + child;
    }, '');
  }

  parent.attribute(name, value);
}

function renderStructure(node, parent) {
  if (node.type.indexOf('@') === 0) {
    renderAttributeStructure(node, parent);
  } else {
    renderElementStructure(node, parent);
  }
}

function isStructure(node) {
  return typeof node === 'object' && typeof node.type === 'string' && typeof node.properties === 'object' && Array.isArray(node.children);
}

function renderNode(node, parent) {
  if (isStructure(node)) {
    return renderStructure(node, parent);
  } else {
    return parent.text(node);
  }
}

function renderBody(body, parent) {
  body.forEach(function(node) {
    renderNode(node, parent);
  });
}

/**
  @class XML
  @constructor
  @param {Object} root
*/
class XML {
  constructor(root) {
    this.root = root;
  }

  /**
    @property root
    @type Object
  */

  /**
    Render the elements described by root, optionally using builder as a parent.

    @method evaluate
    @param {Object} [builder]
    @return {Object}
  */
  render(builder) {
    if (builder) {
      renderNode(this.root, builder);
    } else {
      let builder = Xmlbuilder.begin();
      renderNode(this.root, builder);
      builder.end();
      return builder;
    }
  }
}

module.exports = XML;
