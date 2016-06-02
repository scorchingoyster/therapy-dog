'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const Promise = require('bluebird');
const ModelNotFoundError = require('../errors').ModelNotFoundError;

function buildNotFoundError(dir, model, id) {
  return new ModelNotFoundError('Couldn\'t find model object', { dir, model, id });
}

function contains(main, sub) {
  assert(typeof main === 'string');
  assert(typeof sub === 'string');

  main = path.resolve(main);
  sub = path.resolve(sub);

  return sub.indexOf(main) === 0 && sub.slice(main.length)[0] === path.sep;
}

exports.findById = function(dir, model, id) {
  return new Promise(function(resolve, reject) {
    assert(typeof id === 'string');

    if (id.indexOf(path.sep) !== -1) {
      reject(buildNotFoundError(dir, model, id));
      return;
    }

    let filename = path.join(dir, id + '.json');

    if (!contains(dir, filename)) {
      reject(buildNotFoundError(dir, model, id));
      return;
    }

    fs.access(filename, fs.R_OK, function(error) {
      if (error) {
        reject(buildNotFoundError(dir, model, id));
        return;
      }

      fs.readFile(filename, 'utf8', function(err, data) {
        if (error) {
          reject(buildNotFoundError(dir, model, id));
          return;
        }

        try {
          resolve(new model(id, JSON.parse(data)));
        } catch (e) {
          reject(e);
        }
      });
    });
  });
};
