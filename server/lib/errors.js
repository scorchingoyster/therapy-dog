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

const inherits = require('util').inherits;

/**
 * @class ModelNotFoundError
 * @constructor
 * @param {string} message
 * @param {Object} extra
 * @param {Error} [extra.cause]
 */
exports.ModelNotFoundError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
  if (extra.cause && extra.cause.stack) {
    this.stack = this.stack.concat('\n', extra.cause.stack);
  }
};
inherits(exports.ModelNotFoundError, Error);

/**
 * @class UploadNotFoundError
 * @constructor
 * @param {string} message
 * @param {Object} extra
 * @param {Error} [extra.cause]
 */
exports.UploadNotFoundError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
  if (extra.cause && extra.cause.stack) {
    this.stack = this.stack.concat('\n', extra.cause.stack);
  }
};
inherits(exports.UploadNotFoundError, Error);

/**
 * @class SwordError
 * @constructor
 * @param {string} message
 * @param {Object} extra
 * @param {Error} [extra.cause]
 */
exports.SwordError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
  if (extra.cause && extra.cause.stack) {
    this.stack = this.stack.concat('\n', extra.cause.stack);
  }
};
inherits(exports.SwordError, Error);
