'use strict';

const Promise = require('bluebird');
const Form = require('../models/form');
const generateBundle = require('../deposit/generate-bundle');
const generateSubmission = require('../deposit/generate-submission');
const collectNotificationRecipientEmails = require('../deposit/collect-notification-recipient-emails');
const submitZip = require('../deposit/submit-zip');
const mailer = require('../mailer');
const logging = require('../logging');
const SwordError = require('../errors').SwordError;

exports.create = function(req, res, next) {
  let deposit = req.body;

  // Find the form...
  let form = Form.findById(deposit.form);
  
  // Check input...
  let checkedInput = form.then(f => f.checkInput(deposit.values));

  // Transform input...
  let deserializedInput = Promise.join(form, checkedInput, (f, i) => f.deserializeInput(i));
  let summarizedInput = Promise.join(form, checkedInput, (f, i) => f.summarizeInput(i));

  // Generate a bundle and submission...
  let bundle = Promise.join(form, deserializedInput, generateBundle);
  let submission = Promise.join(form, bundle, generateSubmission);

  // Collect notification recipients...
  let notificationRecipientEmails = Promise.join(form, deserializedInput, collectNotificationRecipientEmails);

  // Submit the deposit, send email notifications, send response.
  Promise.join(form, submission, deposit.depositorEmail, submitZip)
  .then(() => { res.status(204).end(); })
  .then(() => Promise.all([
    Promise.join(form, summarizedInput, deposit.depositorEmail, mailer.sendDepositReceipt),
    Promise.join(form, summarizedInput, notificationRecipientEmails, mailer.sendDepositNotification)
  ]))
  .catch(function(err) {
    if (err instanceof SwordError) {
      logging.error('Received error response from SWORD endpoint: %s', err.extra.body);
    }

    next(err);
  });
};

exports.debug = function(req, res, next) {
  let deposit = req.body;

  // Find the form...
  let form = Form.findById(deposit.form);
  
  // Check input...
  let checkedInput = form.then(f => f.checkInput(deposit.values));

  // Transform input...
  let deserializedInput = Promise.join(form, checkedInput, (f, i) => f.deserializeInput(i));

  // Generate a bundle and submission...
  let bundle = Promise.join(form, deserializedInput, generateBundle);
  let submission = Promise.join(form, bundle, generateSubmission);

  // Respond with the METS.
  submission
  .then((s) => { res.send(s['mets.xml']).end(); })
  .catch(function(err) {
    next(err);
  });
};
