'use strict';

const generateSingle = require('./bundle-types/generate-single');
const generateAggregate = require('./bundle-types/generate-aggregate');

module.exports = function(form, values) {
  if (form.bundle.type === 'single') {
    return generateSingle(form, values);
  } else if (form.bundle.type === 'aggregate') {
    return generateAggregate(form, values);
  } else {
    throw new Error('Unknown bundle type: ' + form.bundle.type);
  }
};
