'use strict';

const path = require('path');
const fs = require('fs');
const glob = require('glob');
const typify = require('typify').create();
const Upload = require('./upload');
const Vocabulary = require('./vocabulary');
const Arrow = require('../arrow');
const FormNotFoundError = require('../errors').FormNotFoundError;
const logging = require('../logging');
const config = require('../../config');

/**
  @module models
*/

const FORMS = {};

if (config.FORMS_DIRECTORY) {
  glob(path.join(config.FORMS_DIRECTORY, '*.json'), function(err, filenames) {
    filenames.forEach(function(filename) {
      try {
        let id = path.basename(filename, '.json');
        let attributes = JSON.parse(fs.readFileSync(filename, 'utf8'));

        FORMS[id] = new Form(id, attributes);
      } catch (e) {
        logging.error('Error loading form: ' + filename);
        logging.error(e.stack);
      }
    });
  });
}

// Define type aliases for checking attributes in the Form constructor.
typify.mutual({
  'form_agreement': '{ type: "agreement", key: string, name: string, uri: string, prompt: string }',
  'form_options': 'string | array string | array { label: string, value: string }',
  'form_checkboxes': '{ type: "checkboxes", key: string, label: string?, options: form_options, required: boolean?, defaultValue: (array string)? }',
  'form_date': '{ type: "date", key: string, label: string, precision: ("year" | "month" | "day")?, required: boolean? }',
  'form_email': '{ type: "email", key: string, label: string, required: boolean?, defaultValue: string?, placeholder: string? }',
  'form_file': '{ type: "file", key: string, label: string?, required: boolean?, multiple: boolean? }',
  'form_radio': '{ type: "radio", key: string, label: string?, options: form_options, required: boolean?, defaultValue: string? }',
  'form_section': '{ type: "section", key: string, label: string?, children: array form_block, repeat: boolean? }',
  'form_select': '{ type: "select", key: string, label: string?, options: form_options, required: boolean?, allowBlank: boolean?, defaultValue: string? }',
  'form_text': '{ type: "text", key: string, label: string?, options: form_options?, required: boolean?, defaultValue: string?, placeholder: string?, size: ("line" | "paragraph")? }',
  'form_block': 'form_agreement | form_checkboxes | form_date | form_email | form_file | form_radio | form_section | form_select | form_text'
});

typify.alias('bundle_single', '{ type: "single", context: string?, upload: string, metadata: (array string)? }');
typify.alias('bundle_items', '{ context: string?, upload: string, metadata: (array string)? }');
typify.alias('bundle_aggregate', '{ type: "aggregate", main: bundle_items, supplemental: (array bundle_items)?, agreements: (array string)? }');
typify.alias('bundle', 'bundle_aggregate | bundle_single');

typify.type('arrow_expression', function(t) {
  return Arrow.check(t);
});

typify.alias('metadata', '{ id: string, type: ("descriptive" | "access-control"), model: "xml", template: arrow_expression }');

typify.alias('form', '{ destination: string, title: string, description: string?, children: array form_block, bundle: bundle, metadata: array metadata }');

/**
  Traverse the given blocks and values, yielding non-section blocks and their
  values to the iterator. Collect the results from the iterator in an object.
  The iterator may return promises, which are resolved in the final result.

  @method mapValues
  @private
  @param {Array} blocks
  @param {Object} values
  @param {Function} iterator
  @return {Promise}
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
  @return {Promise}
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
    // Find the option that matches the value. It may either be a string or a { label, value } object.
    let option = options.find(function(option) {
      if (typeof option === 'string') {
        return value === option;
      } else {
        return value === option.value;
      }
    });

    // Return the option's value.
    if (option) {
      if (typeof option === 'string') {
        return option;
      } else {
        return option.value;
      }
    }
  }
}

/**
  @class Form
  @constructor
  @private
  @param {String} id
  @param {Object} attributes
*/
class Form {
  constructor(id, attributes) {
    typify.assert('form', attributes);

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
    @property metadata
    @type {Array}
  */
  get metadata() {
    return this.attributes.metadata;
  }

  /**
    Return a JSON API resource object representing this form.

    @method getResourceObject
    @return {Promise}
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
    @return {Promise}
  */
  transformValues(values) {
    return mapValues(this.children, values, function(block, value) {
      if (block.type === 'text') {
        return String(value);
      } else if (block.type === 'email') {
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
      } else if (block.type === 'agreement') {
        if (value) {
          return { name: block.name, uri: block.uri, prompt: block.prompt };
        }
      }
    });
  }

  /**
    Find all forms.

    @method findAll
    @static
    @return {Promise}
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
    @return {Promise}
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
