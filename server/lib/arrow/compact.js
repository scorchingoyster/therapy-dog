'use strict';

const isEmpty = require('./utils').isEmpty;

// Mark all nodes in the result with a 'presence' property. There are three possible values for this property: 'literal', 'present', and 'absent'. 'string' nodes are always marked 'literal'. 'data' nodes are marked 'present' or 'absent' depending on whether their value is non-empty or empty, respectively. 'structure' nodes are marked based on the combination of the 'presence' property of their properties and children according to the combinePresence() function.
//
// The effect of this step is that structure nodes with all lookups or arrows resulting in no output are marked as 'absent', nodes only involving boilerplate (structures and strings) are marked 'literal', and other nodes are marked 'present'.

function combinePresence(p1, p2) {
  if (p1 === 'present' || p2 === 'present') {
    return 'present';
  } else if (p1 === 'absent' || p2 === 'absent') {
    return 'absent';
  } else {
    return 'literal';
  }
}

function markNode(node) {
  if (node.type === 'string') {
    return Object.assign({}, node, { presence: 'literal' });
  } else if (node.type === 'data') {
    return Object.assign({}, node, { presence: isEmpty(node.value) ? 'absent' : 'present' });
  } else if (node.type === 'structure') {
    let children = markBody(node.children);

    let properties = Object.keys(node.properties).reduce(function(result, key) {
      return Object.assign({}, result, { [key]: markNode(node.properties[key]) });
    }, {});

    let presence;
    if (node.keep) {
      presence = 'present';
    } else {
      // If a structure has no children or properties, it is marked literal, so use 'literal' as an initial value with reduce.
      presence = combinePresence(
        children.map(c => c.presence).reduce(combinePresence, 'literal'),
        Object.keys(properties).map(k => properties[k].presence).reduce(combinePresence, 'literal')
      );
    }

    return Object.assign({}, node, { children, properties, presence });
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }
}

function markBody(body) {
  return body.map(markNode);
}

function compactBody(body) {
  return body.reduce(function(result, node) {
    if (node.presence === 'absent') {
      return result;
    } else {
      return result.concat(compactNode(node));
    }
  }, []);
}

// Compact the result of the template. Remove any nodes with a 'presence' property of 'absent'.

function compactNode(node) {
  if (node.type === 'structure') {
    return Object.assign({}, node, { children: compactBody(node.children) });
  } else {
    return node;
  }
}

module.exports = function(node) {
  if (Array.isArray(node)) {
    return compactBody(markBody(node));
  } else {
    return compactNode(markNode(node));
  }
};
