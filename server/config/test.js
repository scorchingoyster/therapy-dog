'use strict';

const path = require('path');

module.exports = {
  HOST: '127.0.0.1',
  PORT: '3000',
  SWORD_BASE_URL: 'https://localhost:8443/services/sword/collection/',
  SWORD_USERNAME: 'depositforms',
  SWORD_PASSWORD: 'depositforms',
  FORMS_DIRECTORY: path.join(__dirname, '../test/fixtures/forms'),
  VOCABULARIES_DIRECTORY: path.join(__dirname, '../test/fixtures/vocabularies'),
  UPLOADS_DIRECTORY: path.join(__dirname, '../test/fixtures/uploads')
};
