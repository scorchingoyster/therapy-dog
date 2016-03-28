'use strict';

var Arrow = require('../index');
var XMLDocument = require('./xml/model').XMLDocument;
var XMLElement = require('./xml/model').XMLElement;
var XMLAttribute = require('./xml/model').XMLAttribute;

function parseHash(hash) {
  let options = {};
  let attributes = {};
  let data = false;
  
  Object.keys(hash).forEach(function(key) {
    if (key[0] === "@") {
      options[key.slice(1)] = hash[key].value;
    } else {
      attributes[key] = hash[key].value;
    }

    data = data || hash[key].data;
  });
  
  return { attributes, options, data };
}

module.exports = {
  attribute: Arrow.helper(function(params, hash, body) {
    var name = params[0];
    var parsed = parseHash(hash);
    var options = parsed.options;
    var data = parsed.data;
    
    data = data || name.data;
    name = name.value;
    
    let children = body();
    data = data || children.data;
    
    if (options.compact) {
      children = children.value.filter(function(child) {
        return children.data;
      });
    } else {
      children = children.value;
    }
    
    let keep;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data;
    }
    
    return { value: new XMLAttribute(name, children, keep), data: data };
  }, { raw: true }),
  
  element: Arrow.helper(function(params, hash, body) {
    var name = params[0];
    var parsed = parseHash(hash);
    var attributes = parsed.attributes;
    var options = parsed.options;
    var data = parsed.data;
    
    data = data || name.data;
    name = name.value;
    
    let children = body();
    data = data || children.data;
    
    if (options.compact) {
      children = children.value.filter(function(child) {
        if (child instanceof XMLElement || child instanceof XMLAttribute) {
          return child.keep;
        } else {
          return children.data;
        }
      });
    } else {
      children = children.value;
    }
    
    let keep;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data || children.some(function(child) { return child.keep; });
    }
    
    return { value: new XMLElement(name, attributes, children, keep), data: data };
  }, { raw: true }),
  
  document: Arrow.helper(function(params, hash, body) {
    return new XMLDocument(body()[0]);
  })
};
