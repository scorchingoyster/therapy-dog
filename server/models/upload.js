'use strict';

var Promise = require('promise');
var UploadNotFoundError = require('./errors').UploadNotFoundError;

var UPLOADS = {};

/**
  @class Upload
  @constructor
  @param {String} id
  @param {Object} attributes
*/
function Upload(id, attributes) {
  this.id = id;
  this.attributes = attributes;
}

/**
  The original name of the uploaded file.

  @property name
  @type {String}
*/
Object.defineProperty(Upload.prototype, 'name', {
  get: function() {
    return this.attributes.name;
  }
});

/**
  The uploaded file's MIME type.

  @property type
  @type {String}
*/
Object.defineProperty(Upload.prototype, 'type', {
  get: function() {
    return this.attributes.type;
  }
});

/**
  The size of the uploaded file in bytes.

  @property size
  @type {Number}
*/
Object.defineProperty(Upload.prototype, 'size', {
  get: function() {
    return this.attributes.size;
  }
});

/**
  The path to the uploaded file.

  @property path
  @type {String}
*/
Object.defineProperty(Upload.prototype, 'path', {
  get: function() {
    return this.attributes.path;
  }
});

/**
  Return a JSON API resource object representing this upload.
  
  @method getResourceObject
  @return {Promise<Object>}
*/
Upload.prototype.getResourceObject = function() {
  var _this = this;
  return new Promise(function(resolve, reject) {
    resolve({
      type: 'upload',
      id: _this.id,
      attributes: {
        name: _this.name,
        type: _this.type,
        size: _this.size
      }
    });
  });
};

/**
  Find the upload with the given id.

  @method findById
  @static
  @param {String} id
  @return {Promise<Upload>}
*/
Upload.findById = function(id) {
  return new Promise(function(resolve, reject) {
    var upload = UPLOADS[id];
    if (upload) {
      resolve(upload);
    } else {
      reject(new UploadNotFoundError('Couldn\'t find upload "' + id + '"', { id: id }));
    }
  });
};

/**
  Create a new upload from a multer file object.

  @method createFromFile
  @static
  @param {Object} file
  @return {Promise<Upload>}
*/
Upload.createFromFile = function(file) {
  return new Promise(function(resolve, reject) {
    var upload = new Upload(file.filename, {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: file.path
    });
    UPLOADS[upload.id] = upload;
    resolve(upload);
  });
};

module.exports = Upload;
