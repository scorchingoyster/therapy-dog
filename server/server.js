'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const logging = require('./lib/logging');
const router = require('./router');

// Check that the required environment variables are present (as defined in .env.example)
let missing = Object.keys(dotenv.parse(fs.readFileSync(path.join(__dirname, '.env.example'))))
.filter(function(key) {
  return !process.env[key];
});

if (missing.length > 0) {
  console.error('\nMissing environment variables: ' + missing.join(', '));
  process.exit(1);
}

// Start the server
let app = express();

if (logging.requestLogger) {
  app.use(logging.requestLogger);
}

app.use('/', router);

app.use(logging.errorLogger);

app.use(function(err, req, res, next) {
  /*jshint unused: vars */
  res.status(500);
  res.send({ errors: [{ detail: 'Internal server error' }] });
});

app.listen(process.env.PORT, process.env.HOST, function() {
  console.log('Server started on %s:%d', process.env.HOST, process.env.PORT);
});
