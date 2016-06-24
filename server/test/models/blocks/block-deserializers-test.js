'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const blockDeserializers = require('../../../lib/models/form/block-deserializers');
const UploadNotFoundError = require('../../../lib/errors').UploadNotFoundError;

function deserializeInput(block, value) {
  return Promise.resolve(blockDeserializers[block.type](block, value));
}

describe('Block deserializer', function() {
  describe('select block', function() {
    it('outputs undefined for terms not found in an object array vocabulary', function() {
      let block = {
        type: 'select',
        key: 'language',
        label: 'Language',
        options: 'language'
      };

      return deserializeInput(block, 'other')
      .then(function(result) {
        assert.deepEqual(result, undefined);
      });
    });

    it('outputs undefined for terms not found in a string array vocabulary', function() {
      let block = {
        type: 'select',
        key: 'review',
        label: 'Needs Review?',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]
      };

      return deserializeInput(block, 'maybe')
      .then(function(result) {
        assert.deepEqual(result, undefined);
      });
    });
  });

  describe('checkboxes block', function() {
    it('does not output terms not found in a string array vocabulary', function() {
      let block = {
        type: 'checkboxes',
        key: 'roles',
        label: 'Roles',
        options: 'role'
      };

      return deserializeInput(block, ['Student', 'President'])
      .then(function(result) {
        assert.deepEqual(result, ['Student']);
      });
    });
  });

  describe('file block', function() {
    it('rejects when an upload is not found by the id given', function() {
      let block = {
        type: 'file',
        key: 'article',
        label: 'Article'
      };

      return deserializeInput(block, '71c5a4d1-eb04-4a25-9786-331c27c959d7')
      .then(function() {
        assert(false, 'should reject');
      })
      .catch(function(error) {
        assert.ok(error instanceof UploadNotFoundError, 'should reject with UploadNotFoundError');
      });
    });

    it('does not reject for an absent optional file', function() {
      let block = {
        type: 'file',
        key: 'article',
        label: 'Article'
      };

      return deserializeInput(block, undefined)
      .then(function(result) {
        assert.equal(result, undefined);
      });
    });
  });
});
