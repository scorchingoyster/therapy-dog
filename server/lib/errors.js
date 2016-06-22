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
