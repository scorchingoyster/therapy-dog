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

function processDeposit(deposit) {
  let form, values, summary, bundle, depositorEmail, notificationRecipientEmails;

  depositorEmail = deposit.depositorEmail;
  logging.debug('Saved depositor email for form "%s"', deposit.form, {
    depositorEmail: depositorEmail
  });

  return Form.findById(deposit.form)
  .then(function(f) {
    form = f;

    return form.summarizeInput(deposit.values);
  })
  .then(function(s) {
    summary = s;

    return form.transformValues(deposit.values);
  })
  .then(function(v) {
    values = v;
    logging.debug('Transformed values for form "%s"', deposit.form, {
      values: values
    });

    bundle = generateBundle(form, values);
    logging.debug('Generated bundle for form "%s"', deposit.form, {
      bundle: bundle
    });

    notificationRecipientEmails = collectNotificationRecipientEmails(form, values);
    logging.debug('Collected notification recipient emails for form "%s"', deposit.form, {
      notificationRecipientEmails: notificationRecipientEmails
    });

    return generateSubmission(form, bundle);
  })
  .then(function(submission) {
    logging.debug('Generated submission for form "%s"', deposit.form, {
      submission: Object.keys(submission).reduce(function(object, name) {
        if (submission[name] instanceof Buffer) {
          object[name] = submission[name].toString();
        } else {
          object[name] = submission[name];
        }
        return object;
      }, {})
    });

    return {
      form,
      values,
      summary,
      bundle,
      submission,
      depositorEmail,
      notificationRecipientEmails
    };
  });
}

exports.debug = function(req, res, next) {
  processDeposit(req.body)
  .then(function(results) {
    res.send(results.submission['mets.xml']).end();
  })
  .catch(function(err) {
    next(err);
  });
};

exports.create = function(req, res, next) {
  let form, values, summary, submission, depositorEmail, notificationRecipientEmails;

  processDeposit(req.body)
  .then(function(results) {
    form = results.form;
    values = results.values;
    summary = results.summary;
    submission = results.submission;
    depositorEmail = results.depositorEmail;
    notificationRecipientEmails = results.notificationRecipientEmails;

    return submitZip(form, submission, depositorEmail);
  })
  .then(function(response) {
    res.send(response);

    mailer.sendDepositReceipt(form, summary, depositorEmail);

    if (notificationRecipientEmails.length > 0) {
      mailer.sendDepositNotification(form, summary, notificationRecipientEmails);
    }
  })
  .catch(function(err) {
    if (err instanceof SwordError) {
      logging.error('Received error response from SWORD endpoint: %s', err.extra.body);
    }

    next(err);
  });
};
