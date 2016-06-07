'use strict';

const assert = require('assert');
const Vocabulary = require('../../lib/models/vocabulary');

describe('Vocabulary', function() {
  it('can find a vocabulary by id', function() {
    return Vocabulary.findById('language').then(function(vocab) {
      assert.equal(vocab.id, 'language');
      assert.equal(vocab.labelKey, 'name');
    });
  });

  it('can have notes in options', function() {
    return Vocabulary.findById('cc').then(function(vocab) {
      assert.equal(vocab.noteKey, 'description');
      assert.ok(vocab.options[0].note);
    });
  });

  describe('constructor', function() {
    it('throws a TypeError when passed invalid attributes', function() {
      // Missing the labelKey and valueKey properties.
      let invalid = {
        terms: [{ code: 'eng', name: 'English' }]
      };

      assert.throws(function() {
        /*jshint nonew: false */
        new Vocabulary(null, invalid);
      }, TypeError);
    });
  });
});
