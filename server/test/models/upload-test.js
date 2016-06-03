'use strict';

const assert = require('assert');
const createTestUpload = require('../test-helpers').createTestUpload;

describe('Upload', function() {
  describe('#getResourceObject()', function() {
    it('includes the correct attributes', function() {
      return createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum'))
      .then(function(upload) {
        return upload.getResourceObject();
      })
      .then(function(resourceObject) {
        assert.deepEqual(resourceObject.attributes, {
          name: 'article.pdf',
          type: 'application/pdf',
          size: 11
        });
      });
    });
  });
});
