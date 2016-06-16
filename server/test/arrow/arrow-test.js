'use strict';

const Arrow = require('../../lib/arrow');
const CheckerError = require('../../lib/checker').CheckerError;
const assert = require('assert');

describe('Arrow', function() {
  describe('constructor', function() {
    it('throws a CheckerError when passed an invalid expression', function() {
      // Lookup path isn't an array.
      let invalid = {
        type: 'lookup',
        path: 'blah'
      };

      assert.throws(function() {
        /*jshint nonew: false */
        new Arrow(invalid);
      }, CheckerError);
    });
  });
});
