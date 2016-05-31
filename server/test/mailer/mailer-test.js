'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const Form = require('../../lib/models/form');
const createTestUpload = require('../test-helpers').createTestUpload;
const flattenSummary = require('../../lib/mailer').flattenSummary;

describe('Mailer', function() {
  describe('flattenSummary()', function() {
    it('should flatten summarized values', function() {
      let form = Form.findById('article');
      let article = createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum'));
      let summary = Promise.all([form, article]).spread((f, a) => f.summarizeInput({
        title: 'My Article',
        language: 'eng',
        roles: ['Staff', 'Faculty'],
        review: 'no',
        license: 'CC-BY',
        agreement: true,
        article: a
      }));

      return Promise.all([form, summary]).spread(function(f, s) {
        let flattened = flattenSummary(f.children, s);

        assert.deepEqual(flattened, [
          { label: 'Title', value: 'My Article' },
          { label: 'Language', value: 'English' },
          { label: 'Roles', value: 'Staff, Faculty' },
          { label: 'Needs Review?', value: 'No' },
          { label: 'License', value: 'CC-BY' },
          { label: 'Deposit Agreement', value: 'Accepted' },
          { label: 'Article', value: 'article.pdf' }
        ]);
      });
    });
  });
});
