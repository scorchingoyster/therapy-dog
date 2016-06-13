'use strict';

const inherits = require('util').inherits;

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
