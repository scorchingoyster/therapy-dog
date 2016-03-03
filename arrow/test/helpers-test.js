import Arrow from 'arrow';
import b from 'arrow/builders';
import { deepEqual } from 'assert';
import { registerTestHelpers } from './test-helpers';

describe('Default helpers', () => {
  it('should evaluate the each helper', () => {
    let arrow = new Arrow(`
      each letters as |letter index| { letter; index; }
      each thing as |t| { t; }
      each nothing as |n| { n; } else { "nothing"; }`);
    registerTestHelpers(arrow);
  
    let actual = arrow.evaluate({ letters: ["x", "y"], thing: 123, nothing: null });
    let expected = ["x", 0, "y", 1, 123, "nothing"];
  
    deepEqual(actual, expected);
  });
});
