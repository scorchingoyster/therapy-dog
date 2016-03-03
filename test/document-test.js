import Arrow from '../lib/arrow';
import b from '../lib/builders';
import { deepEqual } from 'assert';
import { registerTestHelpers } from './test-helpers';

const letters = {
  letter: Arrow.helper(function([name], hash, body) {
    return {
      type: 'letter',
      name
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

describe('Documents', () => {
  it('should register the helpers we passed, and wrap output using the "document" helper', () => {
    let arrow = new Arrow('letter "x"; letter "y";', letters);

    let actual = arrow.evaluate();
    let expected = ["x", "y"];
  
    deepEqual(actual, expected);
  });
});
