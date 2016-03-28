'use strict';

var Context = require('./context');
var parse = require('./parser').parse;
var registerDefaultHelpers = require('./helpers').registerDefaultHelpers;
var isEmpty = require('./utils').isEmpty;

function evaluateString(environment, context, node) {
  return { value: node.value, data: false };
}

function evaluateNumber(environment, context, node) {
  return { value: node.value, data: false };
}

function evaluateBoolean(environment, context, node) {
  return { value: node.value, data: false };
}

function blockEvaluator(block, locals, environment, context) {
  return function() {
    var frame, i;
    
    if (!block) {
      return { value: [], data: false };
    }
    
    frame = {};
    for (i = 0; i < locals.length && i < arguments.length; i++) {
      frame[locals[i]] = arguments[i];
    }
  
    return evaluateNode(environment, context.concat(frame), block);
  };
}

function evaluateCall(environment, context, node) {
  if (environment.helpers.hasOwnProperty(node.name)) {
    var helper = environment.helpers[node.name];
    
    var params = node.params.map(function(param) {
      return evaluateNode(environment, context, param);
    });
    
    var hash = node.hash.pairs.reduce(function(hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});
    
    var body = blockEvaluator(node.body, node.locals, environment, context);
    var inverse = blockEvaluator(node.inverse, node.locals, environment, context);
    
    return helper(params, hash, body, inverse);
  } else {
    return context.get(node.name);
  }
}

function evaluateProgram(environment, context, node) {
  var value = [];
  var data = false;
  
  node.body.forEach(function(child) {
    var results = evaluateNode(environment, context, child);
    
    if (typeof results.value !== 'undefined') {
      value = value.concat(results.value);
    }
    
    data = data || results.data;
  });
  
  return { value: value, data: data };
}

function evaluatePath(environment, context, node) {
  return context.get(node.parts);
}

function evaluatePartial(environment, context, node) {
  var name = evaluateNode(environment, context, node.name).value;
  
  if (!environment.partials.hasOwnProperty(name)) {
    return { value: undefined, data: false };
  }
  
  var template = environment.partials[name];
  
  if (node.context) {
    var frame = node.context.pairs.reduce(function(hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});

    context = context.concat(frame);
  }
  
  return evaluateNode(template.environment, context, template.program);
}

function evaluateArrowTarget(environment, context, target, body) {
  if (!environment.helpers.hasOwnProperty(target.name)) {
    throw new Error('All of the parts of an arrow\'s target must be helpers.');
  }
  
  var helper = environment.helpers[target.name];

  var params = target.params.map(function(param) {
    return evaluateNode(environment, context, param);
  });

  var hash = target.hash.pairs.reduce(function(hash, pair) {
    hash[pair.key] = evaluateNode(environment, context, pair.value);
    return hash;
  }, {});
  
  return helper(params, hash, function() { return body; });
}

function evaluateArrow(environment, context, node) {
  var value = [];
  var data = false;
  
  var source = evaluateNode(environment, context, node.source);
  source.value = Array.isArray(source.value) ? source.value : [source.value];
  
  source.value.forEach(function(item) {
    var body;
    var i;
    var target, helper, params, hash;
    
    if (isEmpty(item)) {
      return;
    }
    
    body = { value: item, data: source.data };
    
    for (i = node.target.length - 1; i >= 0; i--) {
      // In order to mimic the result of evaluating a program node, wrap in an array.
      body.value = Array.isArray(body.value) ? body.value : [body.value];
      
      body = evaluateArrowTarget(environment, context, node.target[i], body);
    }
    
    value = value.concat(body.value);
    data = data || body.data;
  });
  
  return { value: value, data: data };
}

function evaluateNode(environment, context, node) {
  var result;
  
  if (node.type === "string") {
    result = evaluateString(environment, context, node);
  } else if (node.type === "number") {
    result = evaluateNumber(environment, context, node);
  } else if (node.type === "boolean") {
    result = evaluateBoolean(environment, context, node);
  } else if (node.type === "call") {
    result = evaluateCall(environment, context, node);
  } else if (node.type === "program") {
    result = evaluateProgram(environment, context, node);
  } else if (node.type === "path") {
    result = evaluatePath(environment, context, node);
  } else if (node.type === "partial") {
    result = evaluatePartial(environment, context, node);
  } else if (node.type === "arrow") {
    result = evaluateArrow(environment, context, node);
  } else {
    throw new Error('Unknown node type: ' + node.type);
  }
  
  return result;
}

function unwrappedEvaluator(block, isData) {
  return function() {
    var wrappedArguments;
    var i;
    var result;
    
    if (!block) {
      return { value: [], data: false };
    }
    
    wrappedArguments = [];
    for (i = 0; i < arguments.length; i++) {
      wrappedArguments.push({ value: arguments[i], data: isData.params || isData.hash });
    }
    
    result = block.apply(undefined, wrappedArguments);
    isData.blocks = isData.blocks || result.data;
    return result.value;
  };
}

function cookedHelper(func) {
  return function(params, hash, body, inverse) {
    var unwrappedParams = params.map(function(p) { return p.value; });
    var unwrappedHash = Object.keys(hash).reduce(function(h, k) { h[k] = hash[k].value; return h; }, {});
    
    var isData = {
      params: params.some(function(p) { return p.data; }),
      hash: Object.keys(hash).some(function(k) { return hash[k].data; }),
      blocks: false
    };
    
    var unwrappedBody = unwrappedEvaluator(body, isData);
    var unwrappedInverse = unwrappedEvaluator(inverse, isData);
    
    return {
      value: func(unwrappedParams, unwrappedHash, unwrappedBody, unwrappedInverse),
      data: isData.params || isData.hash || isData.blocks
    };
  };
}

function parseInput(input) {
  if (input.type === 'program') {
    return input;
  }
  
  return parse(input);
}

function Arrow(input, documentHelpers) {
  this.program = parseInput(input);
  
  this.environment = {
    helpers: {},
    partials: {}
  };
  
  registerDefaultHelpers(this);
  
  if (typeof documentHelpers !== 'undefined') {
    var _this = this;
    Object.keys(documentHelpers).forEach(function(name) {
      var helper = documentHelpers[name];
      
      if (name === 'document') {
        _this.registerDocumentHelper(helper);
      } else {
        _this.registerHelper(name, helper);
      }
    });
  }
}
  
Arrow.prototype.registerDocumentHelper = function(func) {
  this.environment.documentHelper = func;
};
  
Arrow.prototype.registerHelper = function(name, func) {
  this.environment.helpers[name] = func;
};

Arrow.prototype.registerPartial = function(name, template) {
  this.environment.partials[name] = template;
};
  
Arrow.prototype.evaluate = function(input) {
  var result = evaluateNode(this.environment, new Context(input), this.program);
  
  if (typeof this.environment.documentHelper !== 'undefined') {
    return this.environment.documentHelper([], {}, function() { return result; }).value;
  } else {
    return result.value;
  }
};

Arrow.helper = function(func) {
  var raw = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  return raw ? func : cookedHelper(func);
};

module.exports = Arrow;
