'use strict';

var Arrow = require('../../arrow');
var b = require('../../arrow/builders');
var deepEqual = require('assert').deepEqual;
var registerTestHelpers = require('./test-helpers').registerTestHelpers;

var letters = {
  letter: Arrow.helper(function(params, hash, body) {
    var name = params[0];
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
    var arrow = new Arrow('letter "x"; letter "y";', letters);

    var actual = arrow.evaluate();
    var expected = ["x", "y"];
  
    deepEqual(actual, expected);
  });
});
