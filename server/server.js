'use strict';

const express = require('express');
const config = require('./lib/config');
const logging = require('./lib/logging');
const router = require('./lib/router');

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

let server = app.listen(config.get('PORT'), config.get('HOST'), function() {
  console.log('Server started on %s:%s', server.address().address, server.address().port);
});
