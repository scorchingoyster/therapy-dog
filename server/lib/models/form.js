'use strict';

const path = require('path');
const glob = require('glob');
const Upload = require('./upload');
const Vocabulary = require('./vocabulary');
const FormNotFoundError = require('../errors').FormNotFoundError;
const config = require('../../config');

const FORMS = {};

if (config.FORMS_DIRECTORY) {
  glob(path.join(config.FORMS_DIRECTORY, '*.json'), function(err, filenames) {
    filenames.forEach(function(filename) {
      let id = path.basename(filename, '.json');
      FORMS[id] = new Form(id, require(filename));
    });
  });
}

/**
  Traverse the given blocks and values, yielding non-section blocks and their
  values to the iterator. Collect the results from the iterator in an object.
  The iterator may return promises, which are resolved in the final result.

  @method mapValues
  @private
  @param {Array} blocks
  @param {Object} values
  @param {Function} iterator
  @return {Promise<Object>}
*/
function mapValues(blocks, values, iterator) {
  let result = {};

  blocks.forEach(function(block) {
    let key = block.key;
    let value = values[key];

    if (typeof value === 'undefined') {
      return;
    }

    if (block.type === 'section') {
      if (block.repeat) {
        result[key] = Promise.all(value.map(function(item) {
          return mapValues(block.children, item, iterator);
        }));
      } else {
        result[key] = mapValues(block.children, value, iterator);
      }
    } else {
      result[key] = Promise.resolve(iterator(block, value));
    }
  });

  let promised = Object.keys(result).map(function(key) {
    return result[key].then(function(value) {
      result[key] = value;
    });
  });

  return Promise.all(promised).then(function() {
    return result;
  });
}

/**
  Traverse the given blocks, returning a copy of the blocks with vocabulary
  references (any non-section block with a string for its options property)
  replaced with that vocabulary's terms.

  @method resolveVocabularies
  @private
  @param {Array} blocks
  @return {Promise<Array>}
*/
function resolveVocabularies(blocks) {
  return Promise.all(blocks.map(function(block) {
    if (block.type === 'section') {
      return resolveVocabularies(block.children).then(function(children) {
        return Object.assign({}, block, { children: children });
      });
    } else if (typeof block.options === 'string') {
      return Vocabulary.findById(block.options).then(function(vocabulary) {
        return Object.assign({}, block, {
          options: vocabulary.options
        });
      });
    } else {
      return Promise.resolve(block);
    }
  }));
}

/**
  @method transformOptionValue
  @private
*/
function transformOptionValue(options, value) {
  if (typeof options === 'string') {
    return Vocabulary.findById(options).then(function(vocabulary) {
      return vocabulary.getTerm(value);
    });
  } else if (Array.isArray(options)) {
    if (options.indexOf(value) !== -1) {
      return value;
    }
  }
}

/**
  @class Form
  @constructor
  @param {String} id
  @param {Object} attributes
*/
class Form {
  constructor(id, attributes) {
    this.id = id;
    this.attributes = attributes;
  }

  /**
    @property destination
    @type {String}
  */
  get destination() {
    return this.attributes.destination;
  }

  /**
    @property title
    @type {String}
  */
  get title() {
    return this.attributes.title;
  }

  /**
    @property description
    @type {String}
  */
  get description() {
    return this.attributes.description;
  }

  /**
    @property children
    @type {Array}
  */
  get children() {
    return this.attributes.children;
  }

  /**
    @property bundle
    @type {String}
  */
  get bundle() {
    return this.attributes.bundle;
  }

  /**
    @property templates
    @type {Array}
  */
  get templates() {
    return this.attributes.templates;
  }

  /**
    Return a JSON API resource object representing this form.

    @method getResourceObject
    @return {Promise<Object>}
  */
  getResourceObject() {
    let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (options.children) {
      return resolveVocabularies(this.children)
      .then((children) => {
        return {
          type: 'form',
          id: this.id,
          attributes: {
            title: this.title,
            description: this.description,
            children: children
          }
        };
      });
    } else {
      return {
        type: 'form',
        id: this.id,
        attributes: {
          title: this.title,
          description: this.description
        }
      };
    }
  }

  /**
    Transform the given values object so that:
    - it is in the shape defined by the form,
    - values for text and date blocks are strings, and
    - references to Upload instances are replaced with the instances themselves.

    @method transformValues
    @param {Object} values
    @return {Promise<Object>}
  */
  transformValues(values) {
    return mapValues(this.children, values, function(block, value) {
      if (block.type === 'text') {
        return String(value);
      } else if (block.type === 'date') {
        return String(value);
      } else if (block.type === 'select') {
        return transformOptionValue(block.options, value);
      } else if (block.type === 'checkboxes') {
        if (Array.isArray(value)) {
          return Promise.all(value.map(function(v) {
            return transformOptionValue(block.options, v);
          })).then(function(terms) {
            return terms.filter(t => t !== undefined);
          });
        } else {
          return [];
        }
      } else if (block.type === 'radio') {
        return transformOptionValue(block.options, value);
      } else if (block.type === 'file') {
        if (block.multiple) {
          return Promise.all(value.map(function(v) {
            return Upload.findById(v.id);
          }));
        } else {
          return Upload.findById(value.id);
        }
      }
    });
  }

  /**
    Find all forms.

    @method findAll
    @static
    @return {Promise<Array<Form>>}
  */
  static findAll() {
    return new Promise(function(resolve) {
      resolve(Object.keys(FORMS).map(function(id) {
        return FORMS[id];
      }));
    });
  }

  /**
    Find the form with the given id.

    @method findById
    @static
    @param {String} id
    @return {Promise<Form>}
  */
  static findById(id) {
    return new Promise(function(resolve, reject) {
      let form = FORMS[id];
      if (form) {
        resolve(form);
      } else {
        reject(new FormNotFoundError('Couldn\'t find form "' + id + '"', { id: id }));
      }
    });
  }
}

module.exports = Form;
