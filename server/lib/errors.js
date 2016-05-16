'use strict';

const inherits = require('util').inherits;

exports.ModelNotFoundError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};
inherits(exports.ModelNotFoundError, Error);

exports.UploadNotFoundError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};
inherits(exports.UploadNotFoundError, Error);

exports.SwordError = function(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
};
inherits(exports.SwordError, Error);
