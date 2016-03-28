'use strict';

var Promise = require('promise');
var path = require('path');
var glob = require('glob');
var Upload = require('./upload');
var Vocabulary = require('./vocabulary');
var FormNotFoundError = require('../errors').FormNotFoundError;

var FORMS = {};

if (process.env.FORMS_DIRECTORY) {
  glob(path.join(process.env.FORMS_DIRECTORY, "*.json"), function(err, filenames) {
    filenames.forEach(function(filename) {
      var id = path.basename(filename, ".json");
      FORMS[id] = new Form(id, require(filename));
    });
  });
}

/**
  @class Form
  @constructor
  @param {String} id
  @param {Object} attributes
*/
function Form(id, attributes) {
  this.id = id;
  this.attributes = attributes;
}

/**
  @property destination
  @type {String}
*/
Object.defineProperty(Form.prototype, 'destination', {
  get: function() {
    return this.attributes.destination;
  }
});

/**
  @property title
  @type {String}
*/
Object.defineProperty(Form.prototype, 'title', {
  get: function() {
    return this.attributes.title;
  }
});

/**
  @property description
  @type {String}
*/
Object.defineProperty(Form.prototype, 'description', {
  get: function() {
    return this.attributes.description;
  }
});

/**
  @property children
  @type {Array}
*/
Object.defineProperty(Form.prototype, 'children', {
  get: function() {
    return this.attributes.children;
  }
});

/**
  @property bundle
  @type {String}
*/
Object.defineProperty(Form.prototype, 'bundle', {
  get: function() {
    return this.attributes.bundle;
  }
});

/**
  @property templates
  @type {Array}
*/
Object.defineProperty(Form.prototype, 'templates', {
  get: function() {
    return this.attributes.templates;
  }
});

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
        return Object.assign({}, block, { options: vocabulary.terms });
      });
    } else {
      return Promise.resolve(block);
    }
  }));
}

/**
  Return a JSON API resource object representing this form.
  
  @method getResourceObject
  @return {Promise<Object>}
*/
Form.prototype.getResourceObject = function() {
  var _this = this;
  return resolveVocabularies(_this.children)
  .then(function(children) {
    return {
      type: 'form',
      id: _this.id,
      attributes: {
        title: _this.title,
        description: _this.description,
        children: children
      }
    };
  });
};

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
  var result = {};

  blocks.forEach(function(block) {
    var key = block.key;
    var value = values[key];
  
    if (typeof value === 'undefined') {
      return;
    }
  
    if (block.type === "section") {
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
  
  var promised = Object.keys(result).map(function(key) {
    return result[key].then(function(value) {
      result[key] = value;
    });
  });
  
  return Promise.all(promised).then(function() {
    return result;
  });
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
Form.prototype.transformValues = function(values) {
  return mapValues(this.children, values, function(block, value) {
    if (block.type === "text") {
      return String(value);
    } else if (block.type === "date") {
      return String(value);
    } else if (block.type === "select") {
      return value;
    } else if (block.type === "checkboxes") {
      return value;
    } else if (block.type === "radio") {
      return value;
    } else if (block.type === "file") {
      if (block.multiple) {
        return Promise.all(value.map(function(v) {
          return Upload.findById(v.id);
        }));
      } else {
        return Upload.findById(value.id);
      }
    }
  });
};

/**
  Find all forms.
  
  @method findAll
  @static
  @return {Promise<Array<Form>>}
*/
Form.findAll = function() {
  return new Promise(function(resolve, reject) {
    resolve(Object.keys(FORMS).map(function(id) {
      return FORMS[id];
    }));
  });
};

/**
  Find the form with the given id.
  
  @method findById
  @static
  @param {String} id
  @return {Promise<Form>}
*/
Form.findById = function(id) {
  return new Promise(function(resolve, reject) {
    var form = FORMS[id];
    if (form) {
      resolve(form);
    } else {
      reject(new FormNotFoundError('Couldn\'t find form "' + id + '"', { id: id }));
    }
  });
};

module.exports = Form;
