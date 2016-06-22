'use strict';

const checker = require('../checker');
const evaluate = require('./evaluate');
const compact = require('./compact');
const flatten = require('./flatten');

/**
 * @namespace expressionCheckers
 * @memberof Arrow
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

/**
 * Check the string expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.string = checker.shape({
  value: checker.string()
});

/**
 * Check the lookup expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.lookup = checker.shape({
  path: checker.arrayOf(checker.string())
});

/**
 * Check the structure expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.structure = checker.shape({
  keep: checker.optional(checker.boolean()),
  name: checker.string(),
  properties: checker.optional(checker.mapOf(checker.recordTypes({
    string: checker.lookup(expressionCheckers, 'string'),
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }))),
  children: checker.optional(checker.arrayOf(checker.lookup(expressionCheckers, 'expression')))
});

/**
 * Check the each expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.each = checker.shape({
  items: checker.recordTypes({
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }),
  locals: checker.mapOf(checker.string()),
  body: checker.arrayOf(checker.lookup(expressionCheckers, 'expression'))
});

/**
 * Check the choose expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.choose = checker.shape({
  choices: checker.arrayOf(choiceChecker),
  otherwise: checker.optional(checker.arrayOf(checker.lookup(expressionCheckers, 'expression')))
});

/**
 * Check the arrow expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
expressionCheckers.arrow = checker.shape({
  items: checker.recordTypes({
    lookup: checker.lookup(expressionCheckers, 'lookup')
  }),
  target: checker.arrayOf(checker.recordTypes({
    structure: checker.lookup(expressionCheckers, 'structure')
  }))
});

/**
 * Check an Arrow expression.
 * @function
 * @memberof Arrow.expressionCheckers
 * @param {*} value
 * @return {*} The checked value.
 * @throws CheckerError
 */
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
   * Check that the expression is a valid Arrow expression.
   * 
   * @param {Object} expression
   * @return {Boolean}
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

  /**
   * @param {Object} expression
   * @throws {CheckerError}
   */
  constructor(expression) {
    this.expression = expressionCheckers.expression(expression);
  }

  /**
    * @name Arrow#expression
    * @type Object
    */

  /**
   * Evaluate this template using the context.
   * 
   * @param {Object} context
   * @return {*}
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
