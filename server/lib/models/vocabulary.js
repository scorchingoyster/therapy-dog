// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const findById = require('./utils').findById;
const checker = require('../checker');
const config = require('../../config');

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

class Vocabulary {
  /**
   * @param {String} id
   * @param {Object} attributes
   */
  constructor(id, attributes) {
    this.id = id;
    this.attributes = vocabularyChecker(attributes);
  }

  /**
   * @type {Array}
   */
  get terms() {
    return this.attributes.terms;
  }

  /**
   * @type {string}
   */
  get labelKey() {
    return this.attributes.labelKey;
  }

  /**
   * @type {string}
   */
  get valueKey() {
    return this.attributes.valueKey;
  }

  /**
   * @type {string}
   */
  get noteKey() {
    return this.attributes.noteKey;
  }

  /**
   * The terms of this vocabulary as objects with `label`, `value`, and optionally `note` properties.
   * <p>This is used to send a compact representation of the vocabulary to the client for display to users.</p>
   * @type {Array<Object>}
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
        return {
          label: term,
          value: term
        };
      }
    });
  }

  /**
   * Find the term with the given `value`.
   * @param {String} value
   * @return {String|Object}
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
   * Find the vocabulary with the given `id`.
   * @param {String} id
   * @return {Promise<Vocabulary>}
   */
  static findById(id) {
    return findById(config.VOCABULARIES_DIRECTORY, this, id);
  }
}

module.exports = Vocabulary;
