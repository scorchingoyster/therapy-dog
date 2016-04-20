'use strict';

const evaluate = require('./evaluate');
const compact = require('./compact');
const flatten = require('./flatten');

exports.evaluate = function(expression, context) {
  let result = evaluate(expression, context);
  result = compact(result);
  result = flatten(result);

  return result;
};
