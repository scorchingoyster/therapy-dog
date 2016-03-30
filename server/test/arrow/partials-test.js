'use strict';

const Arrow = require('../../lib/arrow');
const deepEqual = require('assert').deepEqual;
const registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Partials', function() {
  it('should evaluate with the current context', function() {
    let outer = new Arrow('each letters as |letter| { partial "inner"; }');
    let inner = new Arrow('letter;');

    outer.registerPartial('inner', inner);

    let actual = outer.evaluate({ letters: ['x', 'y'] });
    let expected = ['x', 'y'];

    deepEqual(actual, expected);
  });

  it('should evaluate to nothing if a matching partial is not registered', function() {
    let outer = new Arrow('partial "inner";');

    let actual = outer.evaluate();
    let expected = [];

    deepEqual(actual, expected);
  });

  it('should accept a call for the partial name', function() {
    let outer = new Arrow('partial name;');
    let inner = new Arrow('"abc";');

    outer.registerPartial('inner', inner);

    let actual = outer.evaluate({ name: 'inner' });
    let expected = ['abc'];

    deepEqual(actual, expected);
  });

  it('should accept a subexpression for the partial name', function() {
    let outer = new Arrow('partial (concat name "-stuff");');
    registerTestHelpers(outer);

    let inner = new Arrow('"abc";');

    outer.registerPartial('inner-stuff', inner);

    let actual = outer.evaluate({ name: 'inner' });
    let expected = ['abc'];

    deepEqual(actual, expected);
  });

  it('should evaluate with additional context', function() {
    let outer = new Arrow('each letters as |letter| { partial "inner" suffix="!"; }');
    let inner = new Arrow('letter; suffix;');

    outer.registerPartial('inner', inner);

    let actual = outer.evaluate({ letters: ['x', 'y'] });
    let expected = ['x', '!', 'y', '!'];

    deepEqual(actual, expected);
  });
});
