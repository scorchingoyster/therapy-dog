'use strict';

const express = require('express');
const config = require('./config');
const logging = require('./lib/logging');
const router = require('./lib/router');

// Start the server
let app = express();

app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache');
  next();
});

if (logging.requestLogger) {
  app.use(logging.requestLogger);
}

app.use('/', router);

app.use(logging.errorLogger);

app.use(function(err, req, res, next) {
  /*jshint unused: vars */
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.header('Content-Type', 'application/vnd.api+json');
  res.send(new Buffer(JSON.stringify({ errors: [{ status: '500', title: 'Internal server error' }] })));
});

let server = app.listen(config.PORT, config.HOST, function() {
  console.log('Server started on %s:%s', server.address().address, server.address().port);
});
