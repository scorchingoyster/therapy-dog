var Promise = require('promise');

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
        name: _this.attributes.name,
        type: _this.attributes.type,
        size: _this.attributes.size
      }
    });
  });
}

/**
  Find the upload with the given id.

  @method findById
  @static
  @param {String} id
  @return {Promise<Upload>}
*/
Upload.findById = function(id) {
  return new Promise(function(resolve, reject) {
    resolve(UPLOADS[id]);
  });
}

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
}

module.exports = Upload;
