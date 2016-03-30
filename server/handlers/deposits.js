'use strict';

const inspect = require('util').inspect;
const Form = require('../models/form');
const generateBundle = require('../deposit/generate-bundle');
const generateSubmission = require('../deposit/generate-submission');
const submitZip = require('../deposit/submit-zip');
const logging = require('../lib/logging');
const SwordError = require('../lib/errors').SwordError;

exports.create = function(req, res, next) {
  let deposit = req.body;
  let form, values, bundle;

  Form.findById(deposit.form)
  .then(function(f) {
    form = f;

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

    return submitZip(form, submission, {
      baseUrl: process.env.DEPOSIT_BASE_URL,
      username: process.env.DEPOSIT_USERNAME,
      password: process.env.DEPOSIT_PASSWORD
    });
  })
  .then(function(result) {
    res.send(result).end();
  })
  .catch(function(err) {
    if (err instanceof SwordError) {
      logging.error('Received error response from SWORD endpoint: %s', err.extra.body);
    }
    
    next(err);
  });
};
