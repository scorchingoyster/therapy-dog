import Arrow from 'arrow';
import * as XML from 'arrow/documents/xml/helpers';
var Bundle = require("./bundle");

function generateBundle(form, values) {
  var arrow = new Arrow(form.bundle, Bundle);
  
  form.templates.forEach(function(template) {
    arrow.registerPartial(template.id, new Arrow(template.template, XML));
  });
  
  return arrow.evaluate(values);
}

module.exports = generateBundle;
