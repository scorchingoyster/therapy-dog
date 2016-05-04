'use strict';

const crypto = require('crypto');
const fs = require('fs');
const uuid = require('uuid');
const Upload = require('../../models/upload');

/**
  @module deposit
  @submodule bundle
*/

/**
  @class File
  @constructor
  @param {Upload|Buffer} contents
  @param {Object} options
  @param {String} [options.name]
  @param {String} [options.mimetype]
*/
class File {
  constructor(contents, options) {
    if (contents instanceof Upload) {
      this.contents = contents;
    } else if (contents instanceof Buffer) {
      this.contents = contents;
    } else {
      throw new TypeError('A file must contain either an Upload or a Buffer');
    }

    this.id = '_' + uuid.v4();
    this._name = options.name;
    this._mimetype = options.mimetype;
  }

  /**
    @property contents
    @type {Upload|Buffer}
  */

  /**
    @property id
    @type {String}
  */

  /**
    @property isUpload
    @type {Boolean}
  */
  get isUpload() {
    return this.contents instanceof Upload;
  }

  /**
    @property isBuffer
    @type {Boolean}
  */
  get isBuffer() {
    return this.contents instanceof Buffer;
  }

  /**
    @property name
    @type {String}
  */
  get name() {
    if (this._name) {
      return this._name;
    } else {
      if (this.isUpload) {
        return this.contents.name;
      } else {
        return 'untitled.txt';
      }
    }
  }

  /**
    @property mimetype
    @type {String}
  */
  get mimetype() {
    if (this._mimetype) {
      return this._mimetype;
    } else {
      if (this.isUpload) {
        return this.contents.type;
      } else {
        return 'text/plain';
      }
    }
  }

  /**
    @property size
    @type {Number}
  */
  get size() {
    if (this.isUpload) {
      return this.contents.size;
    } else {
      return this.contents.length;
    }
  }

  /**
    @method getHashDigest
    @param {String} algorithm
    @param {String} [encoding='utf8']
    @return {Promise}
  */
  getHashDigest(algorithm, encoding) {
    if (this.isUpload) {
      let path = this.contents.path;

      return new Promise(function(resolve) {
        let hash = crypto.createHash(algorithm);
        let input = fs.createReadStream(path);

        input.on('end', function() {
          hash.end();
          resolve(hash.read().toString(encoding));
        });

        input.pipe(hash);
      });
    } else {
      let buffer = this.contents;

      return new Promise(function(resolve) {
        let hash = crypto.createHash(algorithm);
        hash.update(buffer);
        resolve(hash.digest(encoding));
      });
    }
  }
}

module.exports = File;
