/*jshint node:true*/
/* global require, module */
var fs = require('fs');
var path = require('path');
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  
  app.import('vendor/normalize.css');
  
  app.import(path.join(app.bowerDirectory, 'DOMPurify/dist/purify.min.js'));
  
  app.import(path.join(app.bowerDirectory, 'ember-validations/index.js'));
  
  app.import(path.join(app.bowerDirectory, 'jquery-ui/jquery-ui.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/ui/datepicker.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/ui/autocomplete.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/themes/base/jquery-ui.css'));
  
  var imagesDir = path.join(app.bowerDirectory, 'jquery-ui/themes/base/images');
  fs.readdirSync(imagesDir).forEach(function(file) {
    app.import(path.join(imagesDir, file), { destDir: "/assets/images" });
  });

  return app.toTree();
};
