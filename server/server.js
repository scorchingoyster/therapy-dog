'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check that the required environment variables are present (as defined in .env.example)
let missing = Object.keys(dotenv.parse(fs.readFileSync(path.join(__dirname, '.env.example'))))
.filter(function(key) {
  return !process.env[key];
});

if (missing.length > 0) {
  console.error('\nMissing environment variables: ' + missing.join(', '));
  process.exit(1);
}

const express = require('express');
const morgan = require('morgan');
const router = require('./router');

let app = express();
app.use(morgan('dev'));
app.use('/', router);

app.listen(process.env.PORT, process.env.HOST, function() {
  console.log('Server started on %s:%d', process.env.HOST, process.env.PORT);
});
