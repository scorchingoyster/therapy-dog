'use strict';

const generateSingle = require('./generate-single');
const generateAggregate = require('./generate-aggregate');

module.exports = function(form, values) {
  if (form.bundle.type === 'single') {
    return generateSingle(form, values);
  } else if (form.bundle.type === 'aggregate') {
    return generateAggregate(form, values);
  } else {
    throw new Error('Unknown bundle type: ' + form.bundle.type);
  }
};
