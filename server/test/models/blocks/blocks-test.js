'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const blockDeserializers = require('../../../lib/models/form/block-deserializers');
const UploadNotFoundError = require('../../../lib/errors').UploadNotFoundError;

describe('Blocks', function() {
  describe('select block deserializer', function() {
    it('outputs undefined for terms not found in an object array vocabulary', function() {
      let block = {
        type: 'select',
        key: 'language',
        label: 'Language',
        options: 'language'
      };

      return Promise.resolve(blockDeserializers.select(block, 'other'))
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

      return Promise.resolve(blockDeserializers.select(block, 'maybe'))
      .then(function(result) {
        assert.deepEqual(result, undefined);
      });
    });
  });

  describe('checkboxes block deserializer', function() {
    it('does not output terms not found in a string array vocabulary', function() {
      let block = {
        type: 'checkboxes',
        key: 'roles',
        label: 'Roles',
        options: 'role'
      };

      return Promise.resolve(blockDeserializers.checkboxes(block, ['Student', 'President']))
      .then(function(result) {
        assert.deepEqual(result, ['Student']);
      });
    });
  });

  describe('file block deserializer', function() {
    it('rejects when an upload is not found by the id given', function() {
      let block = {
        type: 'file',
        key: 'article',
        label: 'Article'
      };

      return Promise.resolve(blockDeserializers.file(block, '71c5a4d1-eb04-4a25-9786-331c27c959d7'))
      .then(function() {
        assert(false, 'should reject');
      })
      .catch(function(error) {
        assert.ok(error instanceof UploadNotFoundError, 'should reject with UploadNotFoundError');
      });
    });
  });
});
