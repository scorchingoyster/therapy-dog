'use strict';

const Xmlbuilder = require('xmlbuilder');

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
 * Renders XML from Arrow structures using Xmlbuilder.
 */
class XML {
  /**
   * @param {Object} root - the Arrow structure used to render XML.
   */
  constructor(root) {
    this.root = root;
  }

  /**
    * @name XML#root
    * @type Object
    */

  /**
   * Render the elements described by XML#root, optionally using builder as a parent node.
   * 
   * @param {XMLNode} [builder]
   * @return {XMLNode}
   */
  render(builder) {
    if (builder) {
      return renderNode(this.root, builder);
    } else {
      let builder = Xmlbuilder.begin();
      renderNode(this.root, builder);
      builder.end();
      return builder;
    }
  }
}

module.exports = XML;
