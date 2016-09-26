'use strict';

const Promise = require('bluebird');
const Form = require('../models/form');
const destination = require('../models/form');
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

  // Check to see if form destination should go somewhere other than the default location
  form.then((form) => {
    let canOverride = false;
    if (form.allowDestinationOverride !== undefined) {
      canOverride = form.allowDestinationOverride;
    }

    // If the form is coming in from the CDR admin reset the destination UUID to the one it provides.
    if (deposit.destination !== undefined && canOverride) {
      form.destination = deposit.destination
    }
  });

  // Transform input...
  let input = form.then(f => f.deserializeInput(deposit.values));
  let inputSummary = form.then(f => f.summarizeInput(deposit.values));

  // Generate a bundle and submission...
  let bundle = Promise.join(form, input, generateBundle);
  let submission = Promise.join(form, bundle, generateSubmission);

  // Collect notification recipients...
  let notificationRecipientEmails = Promise.join(form, input, collectNotificationRecipientEmails);

  // Submit the deposit, send email notifications, send response.
  Promise.join(form, submission, deposit.depositorEmail, submitZip)
  .then(() => { res.status(204).end(); })
  .then(() => Promise.all([
    Promise.join(form, inputSummary, deposit.depositorEmail, mailer.sendDepositReceipt),
    Promise.join(form, inputSummary, notificationRecipientEmails, mailer.sendDepositNotification)
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

  // Transform input...
  let input = form.then(f => f.deserializeInput(deposit.values));

  // Generate a bundle and submission...
  let bundle = Promise.join(form, input, generateBundle);
  let submission = Promise.join(form, bundle, generateSubmission);

  // Respond with the METS.
  submission
  .then((s) => { res.send(s['mets.xml']).end(); })
  .catch(function(err) {
    next(err);
  });
};
