'use strict';

const findById = require('./utils').findById;
const checker = require('../checker');
const config = require('../../config');

/**
  @module models
*/

// Define checkers for checking attributes in the Vocabulary constructor.

let vocabularyChecker = checker.oneOf([
  checker.shape({
    terms: checker.arrayOf(checker.object()),
    valueKey: checker.string(),
    labelKey: checker.optional(checker.string()),
    noteKey: checker.optional(checker.string())
  }),
  checker.shape({
    terms: checker.arrayOf(checker.string())
  })
]);

/**
  @class Vocabulary
  @constructor
  @private
  @param {String} id
  @param {Object} attributes
*/
class Vocabulary {
  constructor(id, attributes) {
    this.id = id;
    this.attributes = vocabularyChecker(attributes);
  }

  /**
    @property terms
    @type {Array}
  */
  get terms() {
    return this.attributes.terms;
  }

  /**
    @property labelKey
    @type {String}
  */
  get labelKey() {
    return this.attributes.labelKey;
  }

  /**
    @property valueKey
    @type {String}
  */
  get valueKey() {
    return this.attributes.valueKey;
  }

  /**
    @property noteKey
    @type {String}
  */
  get noteKey() {
    return this.attributes.noteKey;
  }

  /**
    @method getOptions
    @type {Array}
  */
  get options() {
    return this.terms.map((term) => {
      if (typeof term === 'object') {
        let option = {
          label: term[this.labelKey],
          value: term[this.valueKey]
        };

        if (this.noteKey) {
          option.note = term[this.noteKey];
        }

        return option;
      } else {
        return term;
      }
    });
  }

  /**
    @method getTerm
    @param {String} value
    @return {String|Object}
  */
  getTerm(value) {
    return this.terms.find((term) => {
      if (typeof term === 'object') {
        return term[this.valueKey] === value;
      } else {
        return term === value;
      }
    });
  }

  /**
    Find the vocabulary with the given id.

    @method findById
    @static
    @param {String} id
    @return {Promise}
  */
  static findById(id) {
    return findById(config.VOCABULARIES_DIRECTORY, this, id);
  }
}

module.exports = Vocabulary;
