'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const router = require('./router');

let app = express();
app.use(morgan('dev'));
app.use('/', router);

app.listen(process.env.PORT, process.env.HOST, function() {
  console.log('Server started on %s:%d', process.env.HOST, process.env.PORT);
});
