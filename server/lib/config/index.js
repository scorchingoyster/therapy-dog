'use strict';

let config;

if (process.env.NODE_ENV === 'production') {
  config = require('./production');
} else if (process.env.NODE_ENV === 'test') {
  config = require('./test');
} else {
  config = require('./development');
}

let keys = ['HOST', 'PORT', 'SWORD_BASE_URL', 'SWORD_USERNAME', 'SWORD_PASSWORD', 'FORMS_DIRECTORY', 'VOCABULARIES_DIRECTORY', 'UPLOADS_DIRECTORY'];

if (process.env.NODE_ENV === 'production') {
  keys.push('LOG_FILENAME');
}

let missing = keys.filter(function(key) {
  return !config[key];
});

if (missing.length > 0) {
  console.error('\nMissing configuration variables: ' + missing.join(', '));
  process.exit(1);
}

module.exports = config;
