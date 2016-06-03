'use strict';

// Flatten the result of the template. 'string' and 'data' nodes are flattened to their values, and 'structure' nodes are have their 'type' property replaced with their 'name' property. 'structure' nodes also have properties related to the compact and presence propagation steps removed.
//
//   { type: 'string', value: s } => s
//   { type: 'data', value: d } => d
//   { type: 'structure', name: n, properties: p, children: c, ... } => { type: n, properties: flatten(p), children: flatten(c) }

function flattenNode(node) {
  /* istanbul ignore else */
  if (node.type === 'string') {
    return node.value;
  } else if (node.type === 'data') {
    return node.value;
  } else if (node.type === 'structure') {
    return {
      type: node.name,
      properties: flattenProperties(node.properties),
      children: flattenBody(node.children)
    };
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }
}

function flattenProperties(properties) {
  return Object.keys(properties).reduce(function(result, key) {
    let node = properties[key];
    let flat = flattenNode(node);

    return Object.assign({}, result, { [key]: flat });
  }, {});
}

function flattenBody(body) {
  return body.reduce(function(result, node) {
    let flat = flattenNode(node);

    return result.concat(flat);
  }, []);
}

module.exports = function(node) {
  if (Array.isArray(node)) {
    return flattenBody(node);
  } else {
    return flattenNode(node);
  }
};
