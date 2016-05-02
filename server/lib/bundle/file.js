'use strict';

const crypto = require('crypto');
const fs = require('fs');
const uuid = require('uuid');
const Upload = require('../models/upload');

class File {
  constructor(children, options) {
    if (children.length === 1 && children[0] instanceof Upload) {
      this.contents = children[0];
    } else if (children.length === 1 && children[0] instanceof Buffer) {
      this.contents = children[0];
    } else {
      throw new Error('A file must contain a single Upload or Buffer.');
    }

    this.id = '_' + uuid.v4();
    this._name = options.name;
    this._mimetype = options.mimetype;
  }

  get isUpload() {
    return this.contents instanceof Upload;
  }

  get isBuffer() {
    return this.contents instanceof Buffer;
  }

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

  get size() {
    if (this.isUpload) {
      return this.contents.size;
    } else {
      return this.contents.length;
    }
  }

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
