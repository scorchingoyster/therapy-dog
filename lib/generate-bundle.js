var Arrow = require("./arrow");
var Bundle = require("./bundle");

function generateBundle(form, values) {
  return new Arrow(Bundle, form.bundle).evaluate(values);
}

module.exports = generateBundle;
