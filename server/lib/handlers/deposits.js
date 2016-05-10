'use strict';

const Form = require('../models/form');
const generateBundle = require('../deposit/generate-bundle');
const generateSubmission = require('../deposit/generate-submission');
const submitZip = require('../deposit/submit-zip');
const logging = require('../logging');
const SwordError = require('../errors').SwordError;

function processDeposit(deposit) {
  let form, values, bundle;

  return Form.findById(deposit.form)
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

    return {
      form: form,
      values: values,
      bundle: bundle,
      submission: submission
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
  processDeposit(req.body)
  .then(function(results) {
    return submitZip(results.form, results.submission);
  })
  .then(function(response) {
    res.send(response).end();
  })
  .catch(function(err) {
    if (err instanceof SwordError) {
      logging.error('Received error response from SWORD endpoint: %s', err.extra.body);
    }

    next(err);
  });
};
