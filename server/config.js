var path = require('path');

module.exports = {
  host: '127.0.0.1',
  port: 3000,
  uploadsDirectory: path.join(__dirname, 'uploads'),
  formsDirectory: path.join(__dirname, 'forms'),
  vocabulariesDirectory: path.join(__dirname, 'vocabularies'),
  depositBaseUrl: 'https://localhost:8443/services/sword/collection/',
  depositUsername: 'depositforms',
  depositPassword: 'depositforms'
};
