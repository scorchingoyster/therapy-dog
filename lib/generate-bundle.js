var Arrow = require("./arrow");
var XML = require("./arrow/xml");
var Bundle = require("./bundle");

function generateBundle(form, values) {
  var arrow = new Arrow(Bundle, form.bundle);
  
  form.templates.forEach(function(template) {
    arrow.registerPartial(template.id, new Arrow(XML, template.template));
  });
  
  return arrow.evaluate(values);
}

module.exports = generateBundle;
