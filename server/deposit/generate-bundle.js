'use strict';

const Arrow = require('../arrow');
const XML = require('../arrow/documents/xml');
const Bundle = require('../bundle');

module.exports = function(form, values) {
  let arrow = new Arrow(form.bundle, Bundle);

  form.templates.forEach(function(template) {
    arrow.registerPartial(template.id, new Arrow(template.template, XML));
  });

  return arrow.evaluate(values);
};
