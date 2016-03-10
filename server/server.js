var express = require('express');
var morgan = require('morgan');
var config = require('./config');

var app = express();

app.use(morgan('dev'));

var api = require('./build/bundle');
api(app, config);

app.listen(config.port, config.host, function() {
  console.log('Server started on %s:%d', config.host, config.port);
});
