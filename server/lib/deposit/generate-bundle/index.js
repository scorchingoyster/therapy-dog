'use strict';

const generateSingle = require('./generate-single');
const generateAggregate = require('./generate-aggregate');

/**
 * Generate a bundle.
 * <p>Depending on the form's bundle type, delegate to either {@link generateSingle} or {@link generateAggregate}.</p>
 * @function
 * @name generateBundle
 * @param {Form} form
 * @param {Object} values
 * @param {String} destination
 * @return {Bundle}
 */
module.exports = function(form, values, depositorSignature) {
  /* istanbul ignore else */
  if (form.bundle.type === 'single') {
    return generateSingle(form, values);
  } else if (form.bundle.type === 'aggregate') {
    return generateAggregate(form, values, depositorSignature);
  } else {
    throw new Error('Unknown bundle type: ' + form.bundle.type);
  }
};
