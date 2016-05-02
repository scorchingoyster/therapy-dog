'use strict';

const uuid = require('uuid');
const XML = require('../../arrow/models/xml');

class Metadata {
  constructor(contents, options) {
    if (contents instanceof XML) {
      this.contents = contents;
    } else {
      throw new TypeError('Metadata must contain an instance of the Arrow XML model');
    }

    this.id = '_' + uuid.v4();
    this.type = options.type;
  }

  get isXML() {
    return true;
  }
}

module.exports = Metadata;
