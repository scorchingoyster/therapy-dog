'use strict';

const Promise = require('bluebird');
const Upload = require('./upload');
const Vocabulary = require('./vocabulary');
const Arrow = require('../arrow');
const checker = require('../checker');
const findById = require('./utils').findById;
const config = require('../../config');

/**
  @module models
*/

// Define checkers for checking attributes in the Form constructor.

// Form options
let optionsChecker = checker.oneOf([
  checker.string(),
  checker.arrayOf(checker.string()),
  checker.arrayOf(checker.shape({
    label: checker.string(),
    value: checker.string(),
    note: checker.optional(checker.string())
  }))
]);

// Blocks
let blockCheckers = {};

blockCheckers.agreement = checker.shape({
  key: checker.string(),
  name: checker.string(),
  uri: checker.string(),
  prompt: checker.string()
});

blockCheckers.checkboxes = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.arrayOf(checker.string())),
  note: checker.optional(checker.string())
});

blockCheckers.date = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  precision: checker.optional(checker.oneOf([
    checker.literal('year'),
    checker.literal('month'),
    checker.literal('day')
  ])),
  required: checker.optional(checker.boolean()),
  note: checker.optional(checker.string())
});

blockCheckers.email = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  placeholder: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

blockCheckers.file = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  required: checker.optional(checker.boolean()),
  multiple: checker.optional(checker.boolean()),
  note: checker.optional(checker.string())
});

blockCheckers.radio = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

blockCheckers.section = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  repeat: checker.optional(checker.boolean()),
  note: checker.optional(checker.string()),
  children: checker.arrayOf(checker.lookup(blockCheckers, 'block'))
});

blockCheckers.select = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  allowBlank: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

blockCheckers.text = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  placeholder: checker.optional(checker.string()),
  size: checker.optional(checker.oneOf([
    checker.literal('line'),
    checker.literal('paragraph')
  ])),
  note: checker.optional(checker.string())
});

blockCheckers.block = checker.recordTypes({
  agreement: checker.lookup(blockCheckers, 'agreement'),
  checkboxes: checker.lookup(blockCheckers, 'checkboxes'),
  date: checker.lookup(blockCheckers, 'date'),
  email: checker.lookup(blockCheckers, 'email'),
  file: checker.lookup(blockCheckers, 'file'),
  radio: checker.lookup(blockCheckers, 'radio'),
  section: checker.lookup(blockCheckers, 'section'),
  select: checker.lookup(blockCheckers, 'select'),
  text: checker.lookup(blockCheckers, 'text')
});

// Bundles
let bundleFileChecker = checker.shape({
  context: checker.optional(checker.string()),
  metadata: checker.optional(checker.arrayOf(checker.string())),
  upload: checker.string()
});

let bundleItemChecker = checker.shape({
  context: checker.optional(checker.string()),
  metadata: checker.optional(checker.arrayOf(checker.string()))
});

let bundleChecker = checker.recordTypes({
  single: checker.shape({
    file: bundleFileChecker
  }),
  aggregate: checker.shape({
    aggregate: checker.optional(bundleItemChecker),
    main: checker.optional(bundleFileChecker),
    supplemental: checker.optional(checker.arrayOf(bundleFileChecker)),
    agreements: checker.optional(checker.arrayOf(checker.string()))
  })
});

// Metadata
let metadataChecker = checker.shape({
  id: checker.string(),
  type: checker.oneOf([
    checker.literal('descriptive'),
    checker.literal('access-control')
  ]),
  model: checker.literal('xml'),
  template: Arrow.expressionCheckers.expression
});

// Notification recipient email expressions
let notificationRecipientEmailChecker = checker.recordTypes({
  string: Arrow.expressionCheckers.string,
  lookup: Arrow.expressionCheckers.lookup
});

// Form
let formChecker = checker.shape({
  destination: checker.string(),
  contact: checker.optional(checker.shape({
    name: checker.string(),
    email: checker.string()
  })),
  title: checker.string(),
  description: checker.optional(checker.string()),
  notificationRecipientEmails: checker.optional(checker.arrayOf(notificationRecipientEmailChecker)),
  children: checker.arrayOf(blockCheckers.block),
  bundle: bundleChecker,
  metadata: checker.arrayOf(metadataChecker)
});

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
        return Promise.resolve(option);
      } else {
        return Promise.resolve(option.value);
      }
    } else {
      return Promise.resolve(undefined);
    }
  }
}

function getOptionLabel(options, value) {
  if (typeof options === 'string') {
    return Vocabulary.findById(options).then(function(vocabulary) {
      let term = vocabulary.getTerm(value);

      if (typeof term === 'object') {
        return term[vocabulary.labelKey];
      } else {
        return term;
      }
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

    // Return the option's label, or the option itself if it is just a string.
    if (option) {
      if (typeof option === 'string') {
        return Promise.resolve(option);
      } else {
        return Promise.resolve(option.label);
      }
    } else {
      return Promise.resolve(undefined);
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
    this.id = id;
    this.attributes = formChecker(attributes);
  }

  /**
    @property destination
    @type {String}
  */
  get destination() {
    return this.attributes.destination;
  }

  /**
    @property contact
    @type {String}
  */
  get contact() {
    return this.attributes.contact;
  }

  /**
    @property notificationRecipientEmails
    @type {String}
  */
  get notificationRecipientEmails() {
    return this.attributes.notificationRecipientEmails;
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
            contact: this.contact,
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
          description: this.description,
          contact: this.contact
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
            return Upload.findById(v);
          }));
        } else {
          return Upload.findById(value);
        }
      } else if (block.type === 'agreement') {
        if (value) {
          return { name: block.name, uri: block.uri, prompt: block.prompt };
        }
      }
    });
  }

  summarizeInput(input) {
    return mapValues(this.children, input, function(block, value) {
      if (block.type === 'text') {
        return String(value);
      } else if (block.type === 'email') {
        return String(value);
      } else if (block.type === 'date') {
        return String(value);
      } else if (block.type === 'select') {
        return getOptionLabel(block.options, value)
        .then(function(label) {
          if (label !== undefined) {
            return label;
          }
        });
      } else if (block.type === 'checkboxes') {
        if (Array.isArray(value)) {
          return Promise.all(value.map(function(v) {
            return getOptionLabel(block.options, v);
          })).then(function(labels) {
            return labels.filter(l => l !== undefined);
          });
        }
      } else if (block.type === 'radio') {
        return getOptionLabel(block.options, value);
      } else if (block.type === 'file') {
        if (block.multiple) {
          return Promise.all(value.map(function(v) {
            return Upload.findById(v);
          }));
        } else {
          return Upload.findById(value);
        }
      } else if (block.type === 'agreement') {
        if (value) {
          return { name: block.name, uri: block.uri, prompt: block.prompt };
        }
      }
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
    return findById(config.FORMS_DIRECTORY, this, id);
  }
}

module.exports = Form;
