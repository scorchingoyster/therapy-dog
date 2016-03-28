require('dotenv').config();
require('source-map-support').install();

var express = require('express');
var morgan = require('morgan');
var api = require('./api');

var app = express();
app.use(morgan('dev'));
app.use('/api', api);

app.listen(process.env.PORT, process.env.HOST, function() {
  console.log('Server started on %s:%d', process.env.HOST, process.env.PORT);
});
