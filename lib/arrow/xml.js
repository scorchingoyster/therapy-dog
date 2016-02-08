var Xmlbuilder = require("xmlbuilder");
var unwrapData = require('./utils').unwrapData;

function renderAttribute(builder, node) {
  var result = "";
  
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    result += String(unwrapData(child));
  }
  
  builder.attribute(node.name, result);
}

function renderElement(builder, node) {
  var element = builder.element(node.name, node.attributes);
  
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    
    if (child.type === "element") {
      renderElement(element, child);
    } else if (child.type === "attribute") {
      renderAttribute(element, child);
    } else {
      element.text(String(unwrapData(child)));
    }
  }
}

function renderDocument(node) {
  var root = Xmlbuilder.create(node.name);
  
  for (var name in node.attributes) {
    if (node.attributes.hasOwnProperty(name)) {
      root.attribute(name, node.attributes[name]);
    }
  }
  
  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];
    
    if (child.type === "element") {
      renderElement(root, child);
    } else if (child.type === "attribute") {
      renderAttribute(root, child);
    } else {
      element.text(String(unwrapData(child)));
    }
  }
  
  return root.root();
}

function parseHash(hash) {
  var attributes = {};
  var options = {};
  var key;
  
  for (key in hash) {
    if (hash.hasOwnProperty(key)) {
      if (key[0] === "@") {
        options[key.slice(1)] = unwrapData(hash[key]);
      } else {
        attributes[key] = unwrapData(hash[key]);
      }
    }
  }
  
  return { attributes: attributes, options: options };
}

function XML(nodes) {
  this.nodes = nodes;
}
  
XML.prototype.render = function(builder) {
  var root;
  
  for (var i = 0; i < this.nodes.length; i++) {
    if (this.nodes[i].type === "element") {
      root = this.nodes[i];
      break;
    }
  }
  
  if (root) {
    if (builder) {
      renderElement(builder, root);
    } else {
      return renderDocument(root).end();
    }
  }
}

XML.helpers = {
  element: function(params, hash, content) {
    var attributesAndOptions = parseHash(hash);
    var attributes = attributesAndOptions.attributes;
    var options = attributesAndOptions.options;
    
    var keep = !!options.keep;
    var children = content.body();
    var i;
    
    if (options.compact) {
      var compacted = [];
      
      for (i = 0; i < children.length; i++) {
        if (children[i].type === "data") {
          compacted.push(children[i]);
        } else if (children[i].type === "element" && children[i].keep === true) {
          compacted.push(children[i]);
        } else if (children[i].type === "attribute" && children[i].keep === true) {
          compacted.push(children[i]);
        }
      }
      
      children = compacted;
    }
    
    if (!keep) {
      for (i = 0; i < children.length; i++) {
        if (children[i].type === "data") {
          keep = true;
          break;
        }
        
        if (children[i].type === "element" && children[i].keep === true) {
          keep = true;
          break;
        }
        
        if (children[i].type === "attribute" && children[i].keep === true) {
          keep = true;
          break;
        }
      }
    }
    
    return {
      type: "element",
      name: unwrapData(params[0]),
      attributes: attributes,
      keep: keep,
      children: children.map(unwrapData)
    };
  },
  
  attribute: function(params, hash, content) {
    var attributesAndOptions = parseHash(hash);
    var options = attributesAndOptions.options;
    
    var keep = !!options.keep;
    var children = content.body();
    var i;
    
    if (options.compact) {
      var compacted = [];
      
      for (i = 0; i < children.length; i++) {
        if (children[i].type === "data") {
          compacted.push(children[i]);
        }
      }
      
      children = compacted;
    }
    
    if (!keep) {
      for (i = 0; i < children.length; i++) {
        if (children[i].type === "data") {
          keep = true;
          break;
        }
      }
    }
    
    return {
      type: "attribute",
      name: unwrapData(params[0]),
      keep: keep,
      children: children.map(unwrapData)
    };
  }
};

module.exports = XML;
