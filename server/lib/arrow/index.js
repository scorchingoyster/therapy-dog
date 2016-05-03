'use strict';

const typify = require('typify').create();
const evaluate = require('./evaluate');
const compact = require('./compact');
const flatten = require('./flatten');

/**
  @module arrow
*/

typify.mutual({
  'expression_string': '{ type: "string", value: string }',
  'expression_lookup': '{ type: "lookup", path: array string }',
  'expression_structure': '{ type: "structure", compact: boolean?, name: string, properties: (map (expression_string | expression_lookup))?, children: (array expression)? }',
  'expression_each': '{ type: "each", items: expression_lookup, locals: map string, body: array expression }',
  'expression_present': '{ name: "present", value: expression_lookup }',
  'expression_predicate': 'expression_present',
  'expression_choice': '{ predicates: array expression_predicate, body: array expression }',
  'expression_choose': '{ type: "choose", choices: array expression_choice, otherwise: (array expression)? }',
  'expression_arrow': '{ type: "arrow", items: expression_lookup, target: array expression_structure }',
  'expression': 'expression_string | expression_lookup | expression_structure | expression_each | expression_choose | expression_arrow'
});

/**
  @class Arrow
  @constructor
  @param {Object} expression
*/
class Arrow {
  /**
    Check that the expression is a valid Arrow expression.

    @method check
    @static
    @param {Object} expression
    @return {Boolean}
  */
  static check(expression) {
    return typify.check('expression', expression);
  }

  constructor(expression) {
    typify.assert('expression', expression);

    this.expression = expression;
  }

  /**
    Evaluate this template using the context.

    @method evaluate
    @param {Object} result
    @return {any}
  */
  evaluate(context) {
    let result = evaluate(this.expression, context);
    result = compact(result);
    result = flatten(result);

    return result;
  }
}

module.exports = Arrow;
