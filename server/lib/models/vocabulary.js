'use strict';

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const VocabularyNotFoundError = require('../errors').VocabularyNotFoundError;
const logging = require('../logging');
const config = require('../../config');

const VOCABULARIES = {};

if (config.VOCABULARIES_DIRECTORY) {
  glob(path.join(config.VOCABULARIES_DIRECTORY, '*.json'), function(err, filenames) {
    filenames.forEach(function(filename) {
      try {
        let id = path.basename(filename, '.json');
        let attributes = JSON.parse(fs.readFileSync(filename, 'utf8'));

        VOCABULARIES[id] = new Vocabulary(id, attributes);
      } catch (e) {
        logging.error('Error loading vocabulary: ' + filename);
        logging.error(e.stack);
      }
    });
  });
}

/**
  @class Vocabulary
  @constructor
  @param {String} id
  @param {Object} attributes
*/
class Vocabulary {
  constructor(id, attributes) {
    this.id = id;
    this.attributes = attributes;
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
    @method getOptions
    @type {Array}
  */
  get options() {
    return this.terms.map((term) => {
      if (typeof term === 'object') {
        return { label: term[this.labelKey], value: term[this.valueKey] };
      } else {
        return term;
      }
    });
  }

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
    @return {Promise<Vocabulary>}
  */
  static findById(id) {
    return new Promise(function(resolve, reject) {
      let vocab = VOCABULARIES[id];
      if (vocab) {
        resolve(vocab);
      } else {
        reject(new VocabularyNotFoundError('Couldn\'t find vocabulary "' + id + '"', { id: id }));
      }
    });
  }
}

module.exports = Vocabulary;
