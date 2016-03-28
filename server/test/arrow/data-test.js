'use strict';

var Arrow = require('../../arrow');
var b = require('../../arrow/builders');
var deepEqual = require('assert').deepEqual;
var registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Data', function() {
  it('should not output undefined values, but still allow the data flag to propagate', function() {
    let arrow = new Arrow('blah; nothing; body-is-data { nothing; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ nothing: undefined });
    let expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should evaluate raw helpers', function() {
    let arrow = new Arrow(`
      params-are-data letters "blah";
      hash-values-are-data ls=letters a=1;
      body-is-data { letters; }
      body-is-data { "blah"; }
      each letters as |letter| { params-are-data letter; }`);
    registerTestHelpers(arrow);
  
    let actual = arrow.evaluate({ letters: ["x", "y"] });
    let expected = [true, false, { ls: true, a: false }, true, false, true, true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through cooked helpers', function() {
    let arrow = new Arrow('body-is-data { each letters as |letter| { concat letter "!"; } }');
    registerTestHelpers(arrow);
  
    let actual = arrow.evaluate({ letters: ["x", "y"] });
    let expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through hash values of cooked helpers', function() {
    let arrow = new Arrow('body-is-data { element "blah" etc=letter; }');
    registerTestHelpers(arrow);
  
    let actual = arrow.evaluate({ letter: "x" });
    let expected = [true];
  
    deepEqual(actual, expected);
  });

  it('should propagate the data flag through chained inverse blocks', function() {
    let arrow = new Arrow('body-is-data { contrary { 1; } else contrary { 2; } else { letter; } }');
    registerTestHelpers(arrow);
  
    let actual = arrow.evaluate({ letter: "x" });
    let expected = [true];
  
    deepEqual(actual, expected);
  });
});
