// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*jshint node:true*/
/* global require, module */
var fs = require('fs');
var path = require('path');
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    fingerprint: {
      prepend: '/forms/'
    }
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
  
  app.import(path.join(app.bowerDirectory, 'jquery-ui/jquery-ui.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/ui/datepicker.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/ui/autocomplete.js'));
  app.import(path.join(app.bowerDirectory, 'jquery-ui/themes/base/jquery-ui.css'));
  
  app.import(path.join(app.bowerDirectory, 'moment/moment.js'));
  
  var imagesDir = path.join(app.bowerDirectory, 'jquery-ui/themes/base/images');
  fs.readdirSync(imagesDir).forEach(function(file) {
    app.import(path.join(imagesDir, file), { destDir: "/assets/images" });
  });
  
  app.import('vendor/tag-it/js/tag-it.js');
  app.import('vendor/tag-it/css/jquery.tagit.css');

  return app.toTree();
};
