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

// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

module.exports = function(app) {
  var globSync   = require('glob').sync;
  var mocks      = globSync('./mocks/**/*.js', { cwd: __dirname }).map(require);
  var proxies    = globSync('./proxies/**/*.js', { cwd: __dirname }).map(require);

  // Log proxy requests
  var morgan  = require('morgan');
  app.use(morgan('dev'));

  mocks.forEach(function(route) { route(app); });
  proxies.forEach(function(route) { route(app); });

};
