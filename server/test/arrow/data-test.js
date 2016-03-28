'use strict';

var Arrow = require('../../arrow');
var b = require('../../arrow/builders');
var deepEqual = require('assert').deepEqual;
var registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Data', function() {
  it('should not output undefined values, but still allow the data flag to propagate', function() {
    var arrow = new Arrow('blah; nothing; body-is-data { nothing; }');
    registerTestHelpers(arrow);

    var actual = arrow.evaluate({ nothing: undefined });
    var expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should evaluate raw helpers', function() {
    var arrow = new Arrow('params-are-data letters "blah"; hash-values-are-data ls=letters a=1; body-is-data { letters; }; body-is-data { "blah"; }; each letters as |letter| { params-are-data letter; }');
    registerTestHelpers(arrow);
  
    var actual = arrow.evaluate({ letters: ["x", "y"] });
    var expected = [true, false, { ls: true, a: false }, true, false, true, true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through cooked helpers', function() {
    var arrow = new Arrow('body-is-data { each letters as |letter| { concat letter "!"; } }');
    registerTestHelpers(arrow);
  
    var actual = arrow.evaluate({ letters: ["x", "y"] });
    var expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through hash values of cooked helpers', function() {
    var arrow = new Arrow('body-is-data { element "blah" etc=letter; }');
    registerTestHelpers(arrow);
  
    var actual = arrow.evaluate({ letter: "x" });
    var expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through chained inverse blocks', function() {
    var arrow = new Arrow('body-is-data { contrary { 1; } else contrary { 2; } else { letter; } }');
    registerTestHelpers(arrow);
  
    var actual = arrow.evaluate({ letter: "x" });
    var expected = [true];
  
    deepEqual(actual, expected);
  });
});
