'use strict';

const uuid = require('uuid');
const XML = require('../arrow/models/xml');

class Metadata {
  constructor(children, options) {
    if (children.length === 1 && children[0] instanceof XML) {
      this.contents = children[0];
    } else {
      throw new Error('Metadata must contain a single instance of the Arrow XML model.');
    }

    this.id = '_' + uuid.v4();
    this.type = options.type;
  }

  get isXML() {
    return true;
  }
}

module.exports = Metadata;
