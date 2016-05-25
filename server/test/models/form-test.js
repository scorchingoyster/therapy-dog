'use strict';

const assert = require('assert');
const Form = require('../../lib/models/form');
const config = require('../../config');
const ModelNotFoundError = require('../../lib/errors').ModelNotFoundError;

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

  it('uses the admin contact name and email as a default contact', function() {
    return Form.findById('poster').then(function(form) {
      assert.deepEqual(form.contact, {
        name: config.ADMIN_CONTACT_NAME,
        email: config.ADMIN_CONTACT_EMAIL
      });
    });
  });

  describe('#getResourceObject()', function() {
    it('converts object array vocabularies to options arrays', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.getResourceObject({ children: true });
      })
      .then(function(resourceObject) {
        let language = resourceObject.attributes.children[1];
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
    it('transforms values to the correct term', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ language: 'eng', roles: ['Staff', 'Faculty'], review: 'no' });
      })
      .then(function(values) {
        assert.deepEqual(values.language, { code: 'eng', name: 'English' });
        assert.deepEqual(values.roles, ['Staff', 'Faculty']);
        assert.deepEqual(values.review, 'no');
      });
    });

    it('does not assign terms not found in an object array vocabulary', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ language: 'other' });
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
  });
});
