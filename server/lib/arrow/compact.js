// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const isEmpty = require('./utils').isEmpty;

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
  /* istanbul ignore else */
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

function compactNode(node) {
  if (node.type === 'structure') {
    let children = compactBody(node.children);

    let properties = Object.keys(node.properties).reduce(function(result, key) {
      if (node.properties[key].presence === 'absent') {
        return result;
      } else {
        return Object.assign({}, result, { [key]: compactNode(node.properties[key]) });
      }
    }, {});

    return Object.assign({}, node, { children, properties });
  } else {
    return node;
  }
}

/**
 * Compact this node and its descendants.
 * <p>First mark all nodes in the input with a 'presence' property, which may be 'literal', 'present', and 'absent'. Nodes are marked as follows:</p>
 * <ul>
 *   <li>'string' nodes are always marked 'literal'.</li>
 *   <li>'data' nodes are marked 'present' or 'absent' depending on whether their value is non-empty or empty, respectively.</li>
 *   <li>'structure' nodes are marked based on the combination of the 'presence' property of their properties and children according to the combinePresence function.</li>
 * </ul>
 * <p>Effectively, structure nodes with all of their lookups or arrows resulting in no output are marked as 'absent', nodes only involving boilerplate (structures and strings) are marked 'literal', and other nodes are marked 'present'.</p>
 * <p>Finally, remove any nodes with a 'presence' property of 'absent'.</p>
 *
 * @function
 * @name compact
 * @param {Object} node
 * @return The compacted node.
 */
module.exports = function(node) {
  if (Array.isArray(node)) {
    return compactBody(markBody(node));
  } else {
    return compactNode(markNode(node));
  }
};
