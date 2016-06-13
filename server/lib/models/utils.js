'use strict';

const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const assert = require('assert');
const ModelNotFoundError = require('../errors').ModelNotFoundError;

exports.findById = function(dir, model, id) {
  return Promise.try(function() {
    assert(typeof id === 'string', 'id must be a string');
    assert(id.indexOf(path.sep) === -1, 'id must not contain the path separator');

    let filename = path.join(dir, id + '.json');

    return fs.accessAsync(filename, fs.R_OK)
    .then(function() {
      return fs.readFileAsync(filename, 'utf8');
    })
    .then(function(data) {
      return new model(id, JSON.parse(data));
    });
  })
  .catch(function(err) {
    throw new ModelNotFoundError(`Couldn't find "${id}": ${err.message}`, { cause: err, dir, model, id });
  });
};
