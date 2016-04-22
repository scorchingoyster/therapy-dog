'use strict';

const assert = require('assert');
const Vocabulary = require('../../lib/models/vocabulary');

describe('Vocabulary', function() {
  it('can find a vocabulary by id', function() {
    return Vocabulary.findById('language').then(function(form) {
      assert.equal(form.id, 'language');
      assert.equal(form.labelKey, 'name');
    });
  });

  it('constructor throws a TypeError when passed invalid attributes', function() {
    // Missing the labelKey and valueKey properties.
    let invalid = {
      terms: [{ code: 'eng', name: 'English' }]
    };

    assert.throws(() => { new Vocabulary(null, invalid); }, TypeError);
  });
});
