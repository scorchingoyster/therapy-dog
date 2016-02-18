var parser = require('./arrow/parser');
var builtin = require('./arrow/helpers');
var utils = require('./arrow/utils');
var isData = utils.isData;
var wrapData = utils.wrapData;
var unwrapData = utils.unwrapData;
var isEmpty = utils.isEmpty;
var eachValue = utils.eachValue;
var toArray = utils.toArray;

var Context = {
  create: function(data) {
    var frame = {};
    
    for (key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key].type === 'data') {
          frame[key] = data[key];
        } else {
          frame[key] = { type: 'data', value: data[key] };
        }
      }
    }
    
    return [frame];
  },
  
  push: function(context, obj) {
    return context.concat(obj);
  },
  
  get: function(context, path) {
    for (var i = context.length - 1; i >= 0; i--) {
      var frame = context[i];
      var property;
      
      if (frame.hasOwnProperty(path[0])) {
        property = frame[path[0]];
      } else {
        continue;
      }
      
      if (property.type === 'data') {
        var data = property.value;
        
        for (var j = 1; j < path.length; j++) {
          var part = path[j];
        
          if (data.hasOwnProperty(part)) {
            data = data[part];
          } else {
            return;
          }
        }
        
        return { type: 'data', value: data };
      } else {
        return property;
      }
    }
  },
  
  dump: function(context) {
    var result = {};
    
    context.forEach(function(frame) {
      Object.keys(frame).forEach(function(key) {
        result[key] = frame[key];
      });
    });
    
    return result;
  }
}

function Arrow(doc, template) {
  this.doc = doc;
  this.partials = {};
  
  if (typeof template === 'string') {
    this.template = parser.parse(template);
  } else if (template.type === 'program') {
    this.template = template;
  }
}

Arrow.prototype.registerPartial = function(name, instance) {
  this.partials[name] = instance;
}

Arrow.prototype.getPartial = function(name) {
  if (this.partials.hasOwnProperty(name)) {
    return this.partials[name];
  }
}

Arrow.prototype.getHelper = function(name) {
  if (this.doc.helpers.hasOwnProperty(name)) {
    return this.doc.helpers[name];
  } else if (builtin.hasOwnProperty(name)) {
    return builtin[name];
  }
}

Arrow.prototype.evaluateProgram = function(node, context) {
  var result = [];
  
  for (var i = 0; i < node.body.length; i++) {
    var evaluated = this.evaluateNode(node.body[i], context);
    
    if (typeof evaluated !== 'undefined') {
      result = result.concat(toArray(evaluated));
    }
  }
  
  return result;
}

Arrow.prototype.evaluateString = function(node, context) {
  return node.value;
}

Arrow.prototype.evaluateBoolean = function(node, context) {
  return node.value;
}

Arrow.prototype.evaluateNumber = function(node, context) {
  return node.value;
}

Arrow.prototype.evaluatePath = function(node, context) {
  return Context.get(context, node.parts);
}

Arrow.prototype.evaluateCall = function(node, context) {
  var helper = this.getHelper(node.name);
  
  // If the call's name doesn't correspond to a helper, try to look it up in the context.
  
  if (!helper) {
    return Context.get(context, [node.name]);
  }
  
  var i;
  
  var params = [];
  for (i = 0; i < node.params.length; i++) {
    params.push(this.evaluateNode(node.params[i], context));
  }

  var hash = {};
  for (i = 0; i < node.hash.pairs.length; i++) {
    var pair = node.hash.pairs[i];
    hash[pair.key] = this.evaluateNode(pair.value, context);
  }
  
  var _this = this;
  
  var body = function() {
    if (!node.body) {
      return [];
    }
    
    var i;
    var locals = {};
    
    for (i = 0; i < arguments.length; i++) {
      if (i < node.locals.length) {
        locals[node.locals[i]] = arguments[i];
      } else {
        break;
      }
    }
    
    return _this.evaluateNode(node.body, Context.push(context, locals));
  }
  
  // FIXME: this is very similar to the body() function we just created!
  
  var inverse = function() {
    if (!node.inverse) {
      return [];
    }
    
    var i;
    var locals = {};
    
    for (i = 0; i < arguments.length; i++) {
      if (i < node.locals.length) {
        locals[node.locals[i]] = arguments[i];
      } else {
        break;
      }
    }
    
    return toArray(_this.evaluateNode(node.inverse, Context.push(context, locals)));
  }
  
  var content = { body: body, inverse: inverse };
  
  return helper(params, hash, content);
}

Arrow.prototype.evaluatePartial = function(node, context) {
  var i;
  
  var params = [];
  for (i = 0; i < node.params.length; i++) {
    params.push(this.evaluateNode(node.params[i], context));
  }

  var hash = {};
  for (i = 0; i < node.hash.pairs.length; i++) {
    var pair = node.hash.pairs[i];
    hash[pair.key] = this.evaluateNode(pair.value, context);
  }
  
  var partialName = unwrapData(params[0]);
  var partial = this.getPartial(partialName);
  
  if (!partial) {
    return;
  }
  
  return partial.evaluate(Context.dump(context));
}

Arrow.prototype.evaluateArrow = function(node, data) {
  var result = [];
  var source = this.evaluateNode(node.source, data);
  
  var _this = this;
  
  eachValue(source, function(value) {
    var content = [value];
    var i, j;
    
    for (i = node.target.length - 1; i >= 0; i--) {
      var target = node.target[i];
      
      var helper = _this.getHelper(target.name);
      if (!helper) {
        throw new Error("Every node in an arrow's target must be a helper call");
      }
      
      var params = [];
      for (j = 0; j < target.params.length; j++) {
        params.push(_this.evaluateNode(target.params[j], data));
      }

      var hash = {};
      for (j = 0; j < target.hash.pairs.length; j++) {
        var pair = target.hash.pairs[j];
        hash[pair.key] = _this.evaluateNode(pair.value, data);
      }
      
      var body = function() {
        return content;
      }
      
      var inverse = function() {
        return [];
      }
      
      content = toArray(helper(params, hash, { body: body, inverse: inverse }));
    }
    
    result = result.concat(content);
  });
  
  return result;
}

Arrow.prototype.evaluateNode = function(node, context) {
  // console.log("evaluate", node, context);
  
  if (node.type === "program") {
    return this.evaluateProgram(node, context);
  } else if (node.type === "string") {
    return this.evaluateString(node, context);
  } else if (node.type === "number") {
    return this.evaluateNumber(node, context);
  } else if (node.type === "boolean") {
    return this.evaluateBoolean(node, context);
  } else if (node.type === "path") {
    return this.evaluatePath(node, context);
  } else if (node.type === "arrow") {
    return this.evaluateArrow(node, context);
  } else if (node.type === "call" && node.name === "partial") {
    return this.evaluatePartial(node, context);
  } else if (node.type === "call") {
    return this.evaluateCall(node, context);
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }
}

Arrow.prototype.evaluate = function(data) {
  return new this.doc(this.evaluateNode(this.template, Context.create(data)));
}

module.exports = Arrow;
