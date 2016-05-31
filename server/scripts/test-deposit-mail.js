'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const mailer = require('../lib/mailer');
const Form = require('../lib/models/form');
const createTestUpload = require('../test/test-helpers').createTestUpload;

let form, upload, summary;

Form.findById('article')
.then(function(f) {
  form = f;

  return createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum'));
})
.then(function(u) {
  upload = u;

  let input = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/input/article.json'), 'utf8'));
  input.article = upload;

  return form.summarizeInput(input);
})
.then(function(s) {
  summary = s;

  return Promise.all([
    mailer.sendDepositReceipt(form, summary, 'depositor@example.com'),
    mailer.sendDepositNotification(form, summary, 'someone@example.com')
  ]);
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.error(err);
  console.error(err.stack);
});
