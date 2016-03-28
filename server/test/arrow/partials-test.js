'use strict';

var Arrow = require('../../arrow');
var b = require('../../arrow/builders');
var deepEqual = require('assert').deepEqual;
var registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Partials', function() {
  it('should evaluate with the current context', function() {
    var outer = new Arrow('each letters as |letter| { partial "inner"; }');
    var inner = new Arrow('letter;');
    
    outer.registerPartial("inner", inner);

    var actual = outer.evaluate({ letters: ["x", "y"] });
    var expected = ["x", "y"];
  
    deepEqual(actual, expected);
  });
  
  it('should evaluate to nothing if a matching partial is not registered', function() {
    var outer = new Arrow('partial "inner";');

    var actual = outer.evaluate();
    var expected = [];
  
    deepEqual(actual, expected);
  });
  
  it('should accept a call for the partial name', function() {
    var outer = new Arrow('partial name;');
    var inner = new Arrow('"abc";');
    
    outer.registerPartial("inner", inner);

    var actual = outer.evaluate({ name: 'inner' });
    var expected = ["abc"];
  
    deepEqual(actual, expected);
  });
  
  it('should accept a subexpression for the partial name', function() {
    var outer = new Arrow('partial (concat name "-stuff");');
    registerTestHelpers(outer);
    
    var inner = new Arrow('"abc";');
    
    outer.registerPartial("inner-stuff", inner);

    var actual = outer.evaluate({ name: 'inner' });
    var expected = ["abc"];
  
    deepEqual(actual, expected);
  });
  
  it('should evaluate with additional context', function() {
    var outer = new Arrow('each letters as |letter| { partial "inner" suffix="!"; }');
    var inner = new Arrow('letter; suffix;');
    
    outer.registerPartial("inner", inner);

    var actual = outer.evaluate({ letters: ["x", "y"] });
    var expected = ["x", "!", "y", "!"];
  
    deepEqual(actual, expected);
  });
});
