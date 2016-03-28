'use strict';

var Arrow = require('../arrow');
var XML = require('../arrow/documents/xml');
var Bundle = require('../bundle');

module.exports = function(form, values) {
  var arrow = new Arrow(form.bundle, Bundle);
  
  form.templates.forEach(function(template) {
    arrow.registerPartial(template.id, new Arrow(template.template, XML));
  });
  
  return arrow.evaluate(values);
}
