import Context from './context';
import { parse } from './parser';
import { registerDefaultHelpers } from './helpers';
import { isEmpty } from './utils';

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
    if (!block) {
      return { value: [], data: false };
    }
    
    let frame = {};
    for (let i = 0; i < locals.length && i < arguments.length; i++) {
      frame[locals[i]] = arguments[i];
    }
  
    return evaluateNode(environment, context.concat(frame), block);
  }
}

function evaluateCall(environment, context, node) {
  if (environment.helpers.hasOwnProperty(node.name)) {
    let helper = environment.helpers[node.name];
    
    let params = node.params.map(function(param) {
      return evaluateNode(environment, context, param);
    });
    
    let hash = node.hash.pairs.reduce(function(hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});
    
    let body = blockEvaluator(node.body, node.locals, environment, context);
    let inverse = blockEvaluator(node.inverse, node.locals, environment, context);
    
    return helper(params, hash, body, inverse);
  } else {
    return context.get(node.name);
  }
}

function evaluateProgram(environment, context, node) {
  let value = [];
  let data = false;
  
  node.body.forEach(function(child) {
    var results = evaluateNode(environment, context, child);
    
    if (typeof results.value !== 'undefined') {
      value = value.concat(results.value);
    }
    
    data = data || results.data;
  });
  
  return { value, data };
}

function evaluatePath(environment, context, node) {
  return context.get(node.parts);
}

function evaluatePartial(environment, context, node) {
  let name = evaluateNode(environment, context, node.name).value;
  
  if (!environment.partials.hasOwnProperty(name)) {
    return { value: undefined, data: false };
  }
  
  let template = environment.partials[name];
  
  if (node.context) {
    let frame = node.context.pairs.reduce(function(hash, pair) {
      hash[pair.key] = evaluateNode(environment, context, pair.value);
      return hash;
    }, {});

    context = context.concat(frame);
  }
  
  return evaluateNode(template.environment, context, template.program);
}

function evaluateArrow(environment, context, node) {
  let value = [];
  let data = false;
  
  let source = evaluateNode(environment, context, node.source);
  source.value = Array.isArray(source.value) ? source.value : [source.value];
  
  source.value.forEach((item) => {
    if (isEmpty(item)) {
      return;
    }
    
    let body = { value: item, data: source.data };
    
    for (let i = node.target.length - 1; i >= 0; i--) {
      let target = node.target[i];
      
      if (!environment.helpers.hasOwnProperty(target.name)) {
        throw new Error(`All of the parts of an arrow's target must be helpers.`);
      }
      
      let helper = environment.helpers[target.name];
    
      let params = target.params.map(function(param) {
        return evaluateNode(environment, context, param);
      });
    
      let hash = target.hash.pairs.reduce(function(hash, pair) {
        hash[pair.key] = evaluateNode(environment, context, pair.value);
        return hash;
      }, {});
      
      // In order to mimic the result of evaluating a program node, wrap in an array.
      body.value = Array.isArray(body.value) ? body.value : [body.value];
      
      body = helper(params, hash, () => body);
    }
    
    value = value.concat(body.value);
    data = data || body.data;
  });
  
  return { value, data };
}

function evaluateNode(environment, context, node) {
  let result;
  
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
    throw new Error(`Unknown node type: ${node.type}`);
  }
  
  return result;
}

function unwrappedEvaluator(block, isData) {
  return function() {
    if (!block) {
      return { value: [], data: false };
    }
    
    let wrappedArguments = [];
    for (let i = 0; i < arguments.length; i++) {
      wrappedArguments.push({ value: arguments[i], data: isData.params || isData.hash });
    }
    
    let result = block(...wrappedArguments);
    isData.blocks = isData.blocks || result.data;
    return result.value;
  }
}

function cookedHelper(func) {
  return function(params, hash, body, inverse) {
    let unwrappedParams = params.map(function(p) { return p.value; });
    let unwrappedHash = Object.keys(hash).reduce(function(h, k) { h[k] = hash[k].value; return h; }, {});
    
    let isData = {
      params: params.some(function(p) { return p.data; }),
      hash: Object.keys(hash).some(function(k) { return hash[k].data; }),
      blocks: false
    };
    
    let unwrappedBody = unwrappedEvaluator(body, isData);
    let unwrappedInverse = unwrappedEvaluator(inverse, isData);
    
    return {
      value: func(unwrappedParams, unwrappedHash, unwrappedBody, unwrappedInverse),
      data: isData.params || isData.hash || isData.blocks
    };
  }
}

function parseInput(input) {
  if (input.type === 'program') {
    return input;
  }
  
  return parse(input);
}

class Arrow {
  constructor(input, documentHelpers) {
    this.program = parseInput(input);
    
    this.environment = {
      helpers: {},
      partials: {}
    };
    
    registerDefaultHelpers(this);
    
    if (typeof documentHelpers !== 'undefined') {
      Object.keys(documentHelpers).forEach((name) => {
        let helper = documentHelpers[name];
        
        if (name === 'document') {
          this.registerDocumentHelper(helper);
        } else {
          this.registerHelper(name, helper);
        }
      });
    }
  }
  
  registerDocumentHelper(func) {
    this.environment.documentHelper = func;
  }
  
  registerHelper(name, func) {
    this.environment.helpers[name] = func;
  }
  
  registerPartial(name, template) {
    this.environment.partials[name] = template;
  }
  
  evaluate(input) {
    var result = evaluateNode(this.environment, new Context(input), this.program);
    
    if (typeof this.environment.documentHelper !== 'undefined') {
      return this.environment.documentHelper([], {}, function() { return result; }).value;
    } else {
      return result.value;
    }
  }
}

Arrow.helper = function(func, { raw } = { raw: false }) {
  return raw ? func : cookedHelper(func);
}

export default Arrow;
