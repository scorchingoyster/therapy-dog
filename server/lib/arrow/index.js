'use strict';

const checker = require('../checker');
const evaluate = require('./evaluate');
const compact = require('./compact');
const flatten = require('./flatten');

/**
  @module arrow
*/

let expressionCheckers = {};

let predicateChecker = checker.recordTypes({
  present: checker.shape({
    value: checker.recordTypes({
      lookup: checker.lookup(expressionCheckers, 'lookup')
    })
  })
});

let choiceChecker = checker.shape({
  predicates: checker.arrayOf(predicateChecker),
  body: checker.arrayOf(checker.lookup(expressionCheckers, 'expression'))
});

expressionCheckers.string = checker.shape({
  value: checker.string()
});

expressionCheckers.lookup = checker.shape({
  path: checker.arrayOf(checker.string())
});

expressionCheckers.structure = checker.shape({
  keep: checker.optional(checker.boolean()),
  name: checker.string(),
  properties: checker.optional(checker.mapOf(checker.recordTypes({
    string: checker.lookup(expressionCheckers, 'string'),
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }))),
  children: checker.optional(checker.arrayOf(checker.lookup(expressionCheckers, 'expression')))
});

expressionCheckers.each = checker.shape({
  items: checker.recordTypes({
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }),
  locals: checker.mapOf(checker.string()),
  body: checker.arrayOf(checker.lookup(expressionCheckers, 'expression'))
});

expressionCheckers.choose = checker.shape({
  choices: checker.arrayOf(choiceChecker),
  otherwise: checker.optional(checker.arrayOf(checker.lookup(expressionCheckers, 'expression')))
});

expressionCheckers.arrow = checker.shape({
  items: checker.recordTypes({
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }),
  target: checker.arrayOf(checker.recordTypes({
    structure: checker.lookup(expressionCheckers, 'structure')
  }))
});

expressionCheckers.expression = checker.recordTypes({
  string: checker.lookup(expressionCheckers, 'string'),
  lookup: checker.lookup(expressionCheckers, 'lookup'),
  structure: checker.lookup(expressionCheckers, 'structure'),
  each: checker.lookup(expressionCheckers, 'each'),
  choose: checker.lookup(expressionCheckers, 'choose'),
  arrow: checker.lookup(expressionCheckers, 'arrow')
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
    try {
      expressionCheckers.expression(expression);
      return true;
    } catch (err) {
      if (err instanceof checker.CheckerError) {
        return false;
      } else {
        throw err;
      }
    }
  }

  constructor(expression) {
    this.expression = expressionCheckers.expression(expression);;
  }

  /**
    Evaluate this template using the context.

    @method evaluate
    @param {Object} context
    @return {any}
  */
  evaluate(context) {
    let result = evaluate(this.expression, context);
    result = compact(result);
    result = flatten(result);

    return result;
  }
}

Arrow.expressionCheckers = expressionCheckers;

module.exports = Arrow;
