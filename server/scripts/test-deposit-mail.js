'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);
const mailer = require('../lib/mailer');
const Form = require('../lib/models/form');
const createTestUpload = require('../test/test-helpers').createTestUpload;

let getForm = Form.findById('article');

let getUpload = createTestUpload('article.pdf', 'application/pdf', new Buffer('lorem ipsum'));

let getInput = Promise.all([
  getUpload,
  readFile(path.join(__dirname, '../data/input/article.json'), 'utf8').then(JSON.parse)
])
.spread((upload, input) => {
  input.article = upload.id;
  return input;
});

let getSummary = Promise.all([getForm, getInput]).spread((form, input) => form.summarizeInput(input));

Promise.all([
  Promise.join(getForm, getSummary, Promise.resolve('depositor@example.com'), mailer.sendDepositReceipt),
  Promise.join(getForm, getSummary, Promise.resolve('someone@example.com'), mailer.sendDepositNotification)
])
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.error(err);
  console.error(err.stack);
});
