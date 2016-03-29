'use strict';

const Arrow = require('../../arrow');
const deepEqual = require('assert').deepEqual;
const registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Default helpers', function() {
  it('should evaluate the each helper', function() {
    let arrow = new Arrow('each letters as |letter index| { letter; index; }; each thing as |t| { t; }; each nothing as |n| { n; } else { "nothing"; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ letters: ['x', 'y'], thing: 123, nothing: null });
    let expected = ['x', 0, 'y', 1, 123, 'nothing'];

    deepEqual(actual, expected);
  });
});
