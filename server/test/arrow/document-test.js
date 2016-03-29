'use strict';

const Arrow = require('../../arrow');
const deepEqual = require('assert').deepEqual;

const letters = {
  letter: Arrow.helper(function(params) {
    let name = params[0];
    return {
      type: 'letter',
      name: name
    };
  }),

  document: Arrow.helper(function(params, hash, body) {
    return body().filter(function(child) {
      return child.type === 'letter';
    }).map(function(letter) {
      return letter.name;
    });
  })
};

describe('Documents', function() {
  it('should register the helpers we passed, and wrap output using the "document" helper', function() {
    let arrow = new Arrow('letter "x"; letter "y";', letters);

    let actual = arrow.evaluate();
    let expected = ["x", "y"];

    deepEqual(actual, expected);
  });
});
