import Arrow from '../lib/arrow';
import b from '../lib/builders';
import { deepEqual } from 'assert';
import { registerTestHelpers } from './test-helpers';

describe('Partials', () => {
  it('should evaluate with the current context', () => {
    let outer = new Arrow('each letters as |letter| { partial "inner"; }');
    let inner = new Arrow('letter;');
    
    outer.registerPartial("inner", inner);

    let actual = outer.evaluate({ letters: ["x", "y"] });
    let expected = ["x", "y"];
  
    deepEqual(actual, expected);
  });
  
  it('should evaluate to nothing if a matching partial is not registered', () => {
    let outer = new Arrow('partial "inner";');

    let actual = outer.evaluate();
    let expected = [];
  
    deepEqual(actual, expected);
  });
  
  it('should accept a call for the partial name', () => {
    let outer = new Arrow('partial name;');
    let inner = new Arrow('"abc";');
    
    outer.registerPartial("inner", inner);

    let actual = outer.evaluate({ name: 'inner' });
    let expected = ["abc"];
  
    deepEqual(actual, expected);
  });
  
  it('should accept a subexpression for the partial name', () => {
    let outer = new Arrow('partial (concat name "-stuff");');
    registerTestHelpers(outer);
    
    let inner = new Arrow('"abc";');
    
    outer.registerPartial("inner-stuff", inner);

    let actual = outer.evaluate({ name: 'inner' });
    let expected = ["abc"];
  
    deepEqual(actual, expected);
  });
  
  it('should evaluate with additional context', () => {
    let outer = new Arrow('each letters as |letter| { partial "inner" suffix="!"; }');
    let inner = new Arrow('letter; suffix;');
    
    outer.registerPartial("inner", inner);

    let actual = outer.evaluate({ letters: ["x", "y"] });
    let expected = ["x", "!", "y", "!"];
  
    deepEqual(actual, expected);
  });
});
