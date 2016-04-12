'use strict';

const express = require('express');
const config = require('./config');
const logging = require('./lib/logging');
const router = require('./lib/router');
const auth = require('./lib/auth');

// Start the server
let app = express();

app.use(auth.requireRemoteUser);

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

let server = app.listen(config.PORT, config.HOST, function() {
  console.log('Server started on %s:%s', server.address().address, server.address().port);
});
