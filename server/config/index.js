'use strict';

let required = ['HOST', 'PORT', 'SWORD_BASE_URL', 'SWORD_USERNAME', 'SWORD_PASSWORD', 'FORMS_DIRECTORY', 'VOCABULARIES_DIRECTORY', 'UPLOADS_DIRECTORY'];
let optional = [];

if (process.env.NODE_ENV === 'production') {
  required.push('LOG_FILENAME');
}

let defaults;

if (process.env.NODE_ENV === 'production') {
  defaults = require('./production');
} else if (process.env.NODE_ENV === 'test') {
  defaults = require('./test');
} else {
  defaults = require('./development');
}

let config = required.concat(optional).reduce(function(hash, key) {
  hash[key] = process.env[key] || defaults[key];
  return hash;
}, {});

let missing = required.filter(function(key) {
  return !config[key];
});

if (missing.length > 0) {
  console.error('\nMissing configuration variables: ' + missing.join(', '));
  process.exit(1);
}

module.exports = config;
