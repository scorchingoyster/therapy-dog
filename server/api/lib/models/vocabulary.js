var Promise = require('promise');
var path = require('path');
var glob = require('glob');

var VOCABULARIES = {};

if (process.env.VOCABULARIES_DIRECTORY) {
  glob(path.join(process.env.VOCABULARIES_DIRECTORY, "*.json"), function(err, filenames) {
    filenames.forEach(function(filename) {
      var id = path.basename(filename, ".json");
      VOCABULARIES[id] = new Vocabulary(id, require(filename));
    });
  });
}

/**
  @class Vocabulary
  @constructor
  @param {String} id
  @param {Object} terms
*/
function Vocabulary(id, terms) {
  this.id = id;
  this.terms = terms;
}

/**
  Find the vocabulary with the given id.
  
  @method findById
  @static
  @param {String} id
  @return {Promise<Vocabulary>}
*/
Vocabulary.findById = function(id) {
  return new Promise(function(resolve, reject) {
    resolve(VOCABULARIES[id]);
  })
}

module.exports = Vocabulary;
