'use strict';

const assert = require('assert');
const Form = require('../../lib/models/form');

describe('Form', function() {
  it('can find a form by id', function() {
    return Form.findById('article').then(function(form) {
      assert.equal(form.id, 'article');
      assert.equal(form.title, 'Article Form');
    });
  });

  it('can find all forms', function() {
    return Form.findAll().then(function(forms) {
      assert.ok(forms.some(f => f.id === 'article'), 'should find the "article" form');
      assert.ok(forms.some(f => f.id === 'poster'), 'should find the "poster" form');
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
        let roles = resourceObject.attributes.children[2];
        assert.deepEqual(roles.options, ['Student', 'Faculty', 'Staff']);

        let license = resourceObject.attributes.children[3];
        assert.deepEqual(license.options, ['CC-BY', 'CC-BY-NC']);
      });
    });
  });

  describe('#transformValues()', function() {
    it('transforms values to the correct term', function() {
      return Form.findById('article')
      .then(function(form) {
        return form.transformValues({ language: 'eng', roles: ['Staff', 'Faculty'] });
      })
      .then(function(values) {
        assert.deepEqual(values.language, { code: 'eng', name: 'English' });
        assert.deepEqual(values.roles, ['Staff', 'Faculty']);
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
