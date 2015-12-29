import Xmlbuilder from "npm:xmlbuilder";

function extend(obj, source) {
  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      obj[key] = source[key];
    }
  }
  return obj;
}

function evaluateElement(node, context) {
  var element = {
    type: "element",
    name: String(node.name),
    compact: node.compact,
    keep: node.keep,
    attributes: extend({}, node.attributes),
    children: []
  };
  
  if (node.children) {
    element.children = evaluateBlock(node.children, context);
  }
  
  return [element];
}

function evaluateAttribute(node, context) {
  var attribute = {
    type: "attribute",
    name: String(node.name),
    compact: node.compact,
    keep: node.keep,
    children: []
  };
  
  if (node.children) {
    attribute.children = evaluateBlock(node.children, context);
  }
  
  return [attribute];
}

function evaluateLiteral(node) {
  var literal = {
    type: "literal",
    value: node.value,
    keep: node.keep
  };
  
  return [literal];
}

function evaluatePath(node, context) {
  var value = context;
  
  for (var i = 0; i < node.parts.length; i++) {
    var part = node.parts[i];
    
    if (part in value) {
      value = value[part];
    } else {
      value = undefined;
      break;
    }
  }
  
  if (typeof value === "undefined") {
    return [];
  } else if (Array.isArray(value)) {
    return value.map(v => ({ type: "literal", value: v, keep: true }));
  } else {
    return [{ type: "literal", value: value, keep: true }];
  }
}

function evaluateArrow(node, context) {
  
  var result = [];
  var list = evaluateNode(node.source, context);
  
  list.forEach(function(item) {
    
    if (item.value === "") {
      return;
    }

    // assemble the "target" and "inner" nodes.
    // here, <e1> is the "target" and <en> is the "inner":
    // 
    //   xs -> <e1> ... <en>
    //
    //   xs as |x| -> <e1> ... <en>
    //     c
  
    var target;
    var inner;
    
    node.target.forEach(function(n) {
      var r = evaluateNode(n, context)[0];
      
      if (target) {
        inner.children = [r];
        inner = r;
      } else {
        target = r;
        inner = r;
      }
      
      return r;
    });
    
    if (target) {
      result.push(target);
      
      // if the node has children, create a new context with the given variable
      // referring to the current item. evaluate the children with that context,
      // setting the inner node's children to be the result.
      
      // otherwise, just set the inner node's children to be the singleton array
      // containing the current item.
      
      if (node.children) {
        var copy = extend({}, context);
        copy[node.variable] = item.value;
        
        inner.children = evaluateBlock(node.children, copy);
      } else {
        inner.children = [item];
      }
    }
    
  });
  
  return result;
  
}

function evaluateNode(node, context) {
  var result;
  
  if (node.type === "element") {
    result = evaluateElement(node, context);
  } else if (node.type === "attribute") {
    result = evaluateAttribute(node, context);
  } else if (node.type === "literal") {
    result = evaluateLiteral(node, context);
  } else if (node.type === "path") {
    result = evaluatePath(node, context);
  } else if (node.type === "arrow") {
    result = evaluateArrow(node, context);
  }
  
  if (Array.isArray(result)) {
    return result;
  } else {
    return [result];
  }
}

function evaluateBlock(block, context) {
  var result = [];
  
  block.forEach(function(node) {
    result = result.concat(evaluateNode(node, context));
  });
  
  return result;
}

function renderAttribute(builder, node) {
  var value = [];
  
  for (let i = 0; i < node.children.length; i++) {
    let child = node.children[i];
    
    if (child.type === "literal") {
      value.push(String(child.value));
    }
  }
  
  builder.att(node.name, value.join(""));
}

function renderElement(builder, node) {
  var element = builder.ele(node.name, node.attributes);
  
  for (let i = 0; i < node.children.length; i++) {
    let child = node.children[i];
    
    if (child.type === "element") {
      renderElement(element, child);
    } else if (child.type === "attribute") {
      renderAttribute(element, child);
    } else if (child.type === "literal") {
      element.txt(String(child.value));
    }
  }
}

function renderDocument(node) {
  var root = Xmlbuilder.create(node.name);
  
  for (let name in node.attributes) {
    if (node.attributes.hasOwnProperty(name)) {
      root.att(name, node.attributes[name]);
    }
  }
  
  for (let i = 0; i < node.children.length; i++) {
    let child = node.children[i];
    
    if (child.type === "element") {
      renderElement(root, child);
    } else if (child.type === "attribute") {
      renderAttribute(root, child);
    } else {
      root.txt(String(child));
    }
  }
  
  return root;
}

function compactBlock(block) {
  for (let i = 0; i < block.length; i++) {
    let node = block[i];
    
    if (node.children) {
      compactBlock(node.children);
      node.keep = node.keep || node.children.some(c => c.keep);
    }
    
    if (node.compact) {
      node.children = node.children.filter(c => c.keep);
    }
  }
}

function stripEvaluationMetadata(block) {
  block.forEach(function(node) {
    delete node.keep;
    delete node.compact;
    if (node.children) {
      stripEvaluationMetadata(node.children);
    }
  });
}

class Arrow {
  constructor(template) {
    this.template = template;
  }
  
  evaluate(context) {
    var result = evaluateBlock(this.template, context);
    compactBlock(result);
    stripEvaluationMetadata(result);
    
    return result;
  }
  
  render(context) {
    var result = this.evaluate(context);
    var root = result[0];
    
    if (root.type === "element") {
      return renderDocument(root).end({ pretty: true });
    }
  }
}

export default Arrow;
