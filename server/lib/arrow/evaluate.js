'use strict';

const isEmpty = require('./utils').isEmpty;

function evaluateString(expression) {
  return { type: 'string', value: expression.value };
}

function evaluateLookup(expression, context) {
  let value = context;
  for (let i = 0; i < expression.path.length; i++) {
    if (expression.path[i] in value) {
      value = value[expression.path[i]];
    } else {
      value = undefined;
      break;
    }
  }
  return { type: 'data', value: value };
}

function evaluateStructure(expression, context) {
  let properties;
  if (expression.properties) {
    properties = Object.keys(expression.properties).reduce(function(result, key) {
      result[key] = evaluateExpression(expression.properties[key], context);
      return result;
    }, {});
  } else {
    properties = {};
  }

  let children;
  if (expression.children) {
    children = evaluateBody(expression.children, context);
  } else {
    children = [];
  }

  let structure = {
    type: 'structure',
    name: expression.name,
    properties,
    children
  };

  if ('keep' in expression) {
    structure.keep = expression.keep;
  }

  return structure;
}

function evaluateEach(expression, context) {
  let items = evaluateExpression(expression.items, context);

  // unwrap
  items = items.value;

  if (isEmpty(items)) {
    return { type: 'data', value: undefined };
  }

  if (!Array.isArray(items)) {
    items = [items];
  }

  // items remain unwrapped when passing as a context, since lookups will wrap them.
  return items.reduce(function(body, item, index) {
    let locals = {};

    if (expression.locals) {
      if (expression.locals.item) {
        locals[expression.locals.item] = item;
      }

      if (expression.locals.index) {
        locals[expression.locals.index] = index;
      }
    }

    return body.concat(evaluateBody(expression.body, Object.assign({}, context, locals)));
  }, []);
}

function testPresent(predicate, context) {
  return !isEmpty(evaluateExpression(predicate.value, context).value);
}

function testPredicates(predicates, context) {
  return predicates.some(function(predicate) {
    if (predicate.name === 'present') {
      return testPresent(predicate, context);
    } else {
      throw new Error('Unknown predicate name: ' + predicate.name);
    }
  });
}

function evaluateChoose(expression, context) {
  for (let i = 0; i < expression.choices.length; i++) {
    if (testPredicates(expression.choices[i].predicates, context)) {
      return evaluateBody(expression.choices[i].body, context);
    }
  }

  if (expression.otherwise) {
    return evaluateBody(expression.otherwise, context);
  }
}

function evaluateArrow(expression, context) {
  let items = evaluateExpression(expression.items, context);

  // unwrap
  items = items.value;

  if (isEmpty(items)) {
    return { type: 'data', value: undefined };
  }

  if (!Array.isArray(items)) {
    items = [items];
  }

  // wrap each item -- they are always data since they come from a lookup expression.
  items = items.map(function(item) {
    return { type: 'data', value: item };
  });

  return items.reduce(function(body, item) {
    let result = item;
    for (let i = expression.target.length - 1; i >= 0; i--) {
      let structure = evaluateStructure(expression.target[i], item);
      structure.children = [result];

      result = structure;
    }
    return body.concat(result);
  }, []);
}

function evaluateBody(expressions, context) {
  return expressions.reduce(function(body, expression) {
    let result = evaluateExpression(expression, context);
    if (result !== undefined) {
      return body.concat(result);
    } else {
      return body;
    }
  }, []);
}

function evaluateExpression(expression, context) {
  if (expression.type === 'string') {
    return evaluateString(expression, context);
  } else if (expression.type === 'lookup') {
    return evaluateLookup(expression, context);
  } else if (expression.type === 'structure') {
    return evaluateStructure(expression, context);
  } else if (expression.type === 'each') {
    return evaluateEach(expression, context);
  } else if (expression.type === 'choose') {
    return evaluateChoose(expression, context);
  } else if (expression.type === 'arrow') {
    return evaluateArrow(expression, context);
  } else {
    throw new Error('Unknown expression type: ' + expression.type);
  }
}

module.exports = evaluateExpression;
