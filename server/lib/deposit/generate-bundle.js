'use strict';

const Arrow = require('../arrow');
const XML = require('../arrow/documents/xml');
const Bundle = require('../bundle');
const generateSingle = require('./bundle-types/generate-single');

module.exports = function(form, values) {
  if (typeof form.bundle === 'object') {
    if (form.bundle.type === 'single') {
      return generateSingle(form, values);
    } else {
      throw new Error('Unknown bundle type: ' + form.bundle.type);
    }
  } else {
    let arrow = new Arrow(form.bundle, Bundle);

    form.templates.forEach(function(template) {
      arrow.registerPartial(template.id, new Arrow(template.template, XML));
    });

    return arrow.evaluate(values);
  }
};
