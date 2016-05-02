'use strict';

const Arrow = require('../../lib/arrow');
const assert = require('assert');

describe('Arrow', function() {
  it('constructor should assert that expressions are valid', function() {
    // Lookup path isn't an array.
    let invalid = {
      type: 'lookup',
      path: 'blah'
    };
    
    assert.throws(function() {
      /*jshint nonew: false */
      new Arrow(null, invalid);
    }, TypeError);
  });
});
