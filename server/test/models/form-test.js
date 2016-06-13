'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const Form = require('../../lib/models/form');
const ModelNotFoundError = require('../../lib/errors').ModelNotFoundError;
const UploadNotFoundError = require('../../lib/errors').UploadNotFoundError;
const createTestUpload = require('../test-helpers').createTestUpload;

describe('Form', function() {
  it('can find a form by id', function() {
    return Form.findById('article').then(function(form) {
      assert.equal(form.id, 'article');
      assert.equal(form.title, 'Article Form');
    });
  });

  it('rejects with ModelNotFoundError when it can\'t find a form', function() {
    return Form.findById('qwerty')
    .then(function() {
      assert(false);
    })
    .catch(function(error) {
      assert.ok(error instanceof ModelNotFoundError, 'error should be an instance of ModelNotFoundError');
      assert.equal(error.extra.model, Form);
      assert.equal(error.extra.id, 'qwerty');
    });
  });

  describe('constructor', function() {
    it('throws a TypeError when passed invalid attributes', function() {
      // Missing the 'upload' property in bundle.
      let invalid = {
        destination: 'uuid:1234',
        title: 'My Form',
        children: [
          { type: 'file', key: 'main' }
        ],
        bundle: {
          type: 'single'
        },
        metadata: []
      };

      assert.throws(function() {
        /*jshint nonew: false */
        new Form(null, invalid);
      }, TypeError);
    });

    it('throws a TypeError when passed invalid metadata template in attributes', function() {
      let invalid = {
        destination: 'uuid:1234',
        title: 'My Form',
        children: [
          { type: 'file', key: 'main' }
        ],
        bundle: {
          type: 'single',
          upload: 'main'
        },
        metadata: [
          {
            id: 'mods',
            type: 'descriptive',
            model: 'xml',
            template: { invalid: 'template' }
          }
        ]
      };

      assert.throws(function() {
        /*jshint nonew: false */
        new Form(null, invalid);
      }, TypeError);
    });
  });

  it('may have a contact', function() {
    return Form.findById('article').then(function(form) {
      assert.deepEqual(form.contact, { name: 'Someone', email: 'someone@example.com' });
    });
  });

  describe('#getResourceObject()', function() {
    it('converts object array vocabularies to options arrays', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.getResourceObject({ children: true });
      })
      .then(function(resourceObject) {
        let language = resourceObject.attributes.children[1].children[1];
        assert.deepEqual(language.options, [
          { label: 'English', value: 'eng' },
          { label: 'Spanish; Castilian', value: 'spa' }
        ]);
      });
    });

    it('does not convert string array vocabularies or literal options to options arrays', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.getResourceObject({ children: true });
      })
      .then(function(resourceObject) {
        let roles = resourceObject.attributes.children.find(c => c.key === 'roles');
        assert.deepEqual(roles.options, ['Student', 'Faculty', 'Staff']);

        let review = resourceObject.attributes.children.find(c => c.key === 'review');
        assert.deepEqual(review.options, [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]);

        let license = resourceObject.attributes.children.find(c => c.key === 'license');
        assert.deepEqual(license.options, ['CC-BY', 'CC-BY-NC']);
      });
    });

    it('should include title, description, and contact information', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.getResourceObject();
      })
      .then(function(resourceObject) {
        assert.ok(resourceObject.attributes.title);
        assert.ok(resourceObject.attributes.description);
        assert.ok(resourceObject.attributes.contact);
      });
    });
  });

  describe('#transformValues()', function() {
    it('transforms values to the correct shape, with correct vocabulary terms and upload instances', function() {
      let form = Form.findById('article');
      let uploads = Promise.props({
        article: createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum')),
        supplemental: createTestUpload('data.csv', 'application/csv', new Buffer('lorem ipsum'))
      });

      return Promise.all([form, uploads]).spread((form, uploads) => form.transformValues({
        authors: [
          { first: 'Some', last: 'Author' },
          { first: 'Another', last: 'Author' }
        ],
        info: {
          title: 'My Article',
          language: 'eng'
        },
        roles: ['Staff', 'Faculty'],
        review: 'no',
        article: uploads.article.id,
        supplemental: [
          uploads.supplemental.id
        ]
      }))
      .then(function(values) {
        assert.deepEqual(values.authors, [
          { first: 'Some', last: 'Author' },
          { first: 'Another', last: 'Author' }
        ]);
        assert.equal(values.info.title, 'My Article');
        assert.deepEqual(values.info.language, { code: 'eng', name: 'English' });
        assert.deepEqual(values.roles, ['Staff', 'Faculty']);
        assert.equal(values.review, 'no');
        assert.equal(values.article.name, 'article.pdf');
        assert.deepEqual(values.supplemental.map(u => u.name), ['data.csv']);
      });
    });

    it('does not assign terms not found in an object array vocabulary', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ info: { language: 'other' } });
      })
      .then(function(values) {
        assert.equal(values.language, undefined);
      });
    });

    it('does not assign terms not found in a string array vocabulary', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ roles: ['Student', 'President'] });
      })
      .then(function(values) {
        assert.deepEqual(values.roles, ['Student']);
      });
    });

    it('does not assign terms not found in a literal options array', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ review: 'maybe' });
      })
      .then(function(values) {
        assert.deepEqual(values.review, undefined);
      });
    });

    it('transforms agreements to an object representing the agreement', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ agreement: true });
      })
      .then(function(values) {
        assert.deepEqual(values.agreement, {
          name: 'Deposit Agreement',
          uri: 'http://example.com/agreement',
          prompt: 'I agree to the terms in the agreement.'
        });
      });
    });

    it('rejects when an upload is not found by the id given', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({
          article: { id: '71c5a4d1-eb04-4a25-9786-331c27c959d7' }
        });
      })
      .then(function() {
        assert(false, 'should reject');
      })
      .catch(function(error) {
        assert.ok(error instanceof UploadNotFoundError, 'should reject with UploadNotFoundError');
      });
    });
  });

  describe('#summarizeInput()', function() {
    it('transforms values to the correct shape, with correct vocabulary terms and upload instances', function() {
      let form = Form.findById('article');
      let uploads = Promise.props({
        article: createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum')),
        supplemental: createTestUpload('data.csv', 'application/csv', new Buffer('lorem ipsum'))
      });

      return Promise.all([form, uploads]).spread((form, uploads) => form.summarizeInput({
        authors: [
          { first: 'Some', last: 'Author' },
          { first: 'Another', last: 'Author' }
        ],
        info: {
          title: 'My Article',
          language: 'eng'
        },
        roles: ['Staff', 'Faculty'],
        review: 'no',
        article: uploads.article.id,
        supplemental: [
          uploads.supplemental.id
        ]
      }))
      .then(function(values) {
        assert.deepEqual(values.authors, [
          { first: 'Some', last: 'Author' },
          { first: 'Another', last: 'Author' }
        ]);
        assert.equal(values.info.title, 'My Article');
        assert.deepEqual(values.info.language, 'English');
        assert.deepEqual(values.roles, ['Staff', 'Faculty']);
        assert.equal(values.review, 'No');
        assert.equal(values.article.name, 'article.pdf');
        assert.deepEqual(values.supplemental.map(u => u.name), ['data.csv']);
      });
    });

    it('does not assign terms not found in a literal options array', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.summarizeInput({ review: 'maybe' });
      })
      .then(function(values) {
        assert.deepEqual(values.review, undefined);
      });
    });
  });
});
