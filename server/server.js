require('dotenv').config();

var express = require('express');
var morgan = require('morgan');
var router = require('./router');

var app = express();
app.use(morgan('dev'));
app.use('/api', router);

app.listen(process.env.PORT, process.env.HOST, function() {
  console.log('Server started on %s:%d', process.env.HOST, process.env.PORT);
});
