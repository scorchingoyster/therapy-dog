'use strict';

const uuid = require('uuid');
const XML = require('../../arrow/models/xml');

class Metadata {
  /**
   * @param {XML} contents
   * @param {Object} [options]
   * @param {String} [options.type]
   */
  constructor(contents/*, options={}*/) {
    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (contents instanceof XML) {
      this.contents = contents;
    } else {
      throw new TypeError('Metadata must contain an instance of the Arrow XML model');
    }

    this.id = '_' + uuid.v4();
    this.type = options.type;
  }

  /**
   * @name Metadata#contents
   * @type XML
   */

  /**
   * @type Boolean
   */
  get isXML() {
    return true;
  }

  /**
   * @name Metadata#id
   * @type String
   */

  /**
   * @name Metadata#type
   * @type String
   */
}

module.exports = Metadata;
