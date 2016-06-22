'use strict';

const uuid = require('uuid');
const XML = require('../../arrow/models/xml');

/**
  @module deposit
  @submodule bundle
*/

/**
  @class Metadata
  @constructor
  @param {XML} contents
  @param {Object} [options]
  @param {String} [options.type]
*/
class Metadata {
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
    @property contents
    @type XML
  */

  /**
    @property isXML
    @type Boolean
  */
  get isXML() {
    return true;
  }

  /**
    @property id
    @type String
  */

  /**
    @property type
    @type String
  */
}

module.exports = Metadata;
