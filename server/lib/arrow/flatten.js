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

/**
 * Flatten the node and its descendants.
 * <p>'string' and 'data' nodes are replaced with their values, and 'structure' nodes are have their 'type' property replaced with their 'name' property. 'structure' nodes also have properties related to the compact step removed.</p>
 * <pre>
 * { type: 'string', value: s, ... } => s
 * { type: 'data', value: d, ... } => d
 * { type: 'structure', name: n, properties: p, children: c, ... } =>
 *     { type: n, properties: flattenProperties(p), children: flatten(c) }
 * </pre>
 *
 * @function
 * @name flatten
 * @param {Object} node
 * @return The flattened node.
 */
module.exports = function(node) {
  if (Array.isArray(node)) {
    return flattenBody(node);
  } else {
    return flattenNode(node);
  }
};
