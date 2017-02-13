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
'use strict';

const Arrow = require('../../lib/arrow');
const CheckerError = require('../../lib/checker').CheckerError;
const assert = require('assert');

describe('Arrow', function() {
  describe('constructor', function() {
    it('throws a CheckerError when passed an invalid expression', function() {
      // Lookup path isn't an array.
      let invalid = {
        type: 'lookup',
        path: 'blah'
      };

      assert.throws(function() {
        /*jshint nonew: false */
        new Arrow(invalid);
      }, CheckerError);
    });
  });
});
