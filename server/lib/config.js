'use strict';

const path = require('path');
const nconf = require('nconf');

nconf.env();

if (process.env.NODE_ENV !== 'production') {
  nconf.defaults({
    HOST: '127.0.0.1',
    PORT: '3000',
    SWORD_BASE_URL: 'https://localhost:8443/services/sword/collection/',
    SWORD_USERNAME: 'depositforms',
    SWORD_PASSWORD: 'depositforms',
    FORMS_DIRECTORY: path.join(__dirname, '../data/forms'),
    VOCABULARIES_DIRECTORY: path.join(__dirname, '../data/vocabularies'),
    UPLOADS_DIRECTORY: path.join(__dirname, '../data/uploads')
  });
}

let keys = ['HOST', 'PORT', 'SWORD_BASE_URL', 'SWORD_USERNAME', 'SWORD_PASSWORD', 'FORMS_DIRECTORY', 'VOCABULARIES_DIRECTORY', 'UPLOADS_DIRECTORY'];

let missing = keys.filter(function(key) {
  return !nconf.get(key);
});

if (missing.length > 0) {
  console.error('\nMissing environment variables: ' + missing.join(', '));
  process.exit(1);
}

exports.get = function(key) {
  return nconf.get(key);
};
