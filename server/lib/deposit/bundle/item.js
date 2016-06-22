'use strict';

const uuid = require('uuid');
const File = require('./file');
const Metadata = require('./metadata');
const Link = require('./link');

class Item {
  /**
   * @param {Array<Item|File|Metadata|Link>} children
   * @param {Object} [options]
   * @param {String} [options.type]
   * @param {String} [options.label]
   */
  constructor(children/*, options={}*/) {
    let options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    children.forEach(function(child) {
      if (!(child instanceof Item || child instanceof File || child instanceof Metadata || child instanceof Link)) {
        throw new TypeError('An item may only contain items, files, metadata, and links');
      }
    });

    this.children = children;
    this.id = '_' + uuid.v4();
    this.type = options.type;
    this.label = options.label;
  }

  /**
   * @name Item#children
   * @type Array<Item|File|Metadata|Link>
   */

  /**
   * @name Item#id
   * @type String
   */

  /**
   * @name Item#type
   * @type String
   */

  /**
   * @name Item#label
   * @type String
   */
}

module.exports = Item;
