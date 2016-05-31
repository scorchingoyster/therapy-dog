'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);
const mailer = require('../lib/mailer');
const Form = require('../lib/models/form');
const createTestUpload = require('../test/test-helpers').createTestUpload;

let form = Form.findById('article');

let upload = createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum'));

let input = Promise.all([
  upload,
  readFile(path.join(__dirname, '../data/input/article.json'), 'utf8').then(JSON.parse)
])
.spread((u, i) => {
  i.article = u;
  return i;
});

let summary = Promise.all([form, input]).spread((f, i) => f.summarizeInput(i));

Promise.all([
  Promise.join(form, summary, Promise.resolve('depositor@example.com'), mailer.sendDepositReceipt),
  Promise.join(form, summary, Promise.resolve('someone@example.com'), mailer.sendDepositNotification)
])
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.error(err);
  console.error(err.stack);
});
