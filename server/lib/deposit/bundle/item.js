'use strict';

const uuid = require('uuid');
const File = require('./file');
const Metadata = require('./metadata');
const Link = require('./link');

/**
  @module deposit
  @submodule bundle
*/

/**
  @class Item
  @constructor
  @param {Array} children
  @param {Object} options
  @param {String} [options.type]
  @param {String} [options.label]
*/
class Item {
  constructor(children, options) {
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
    @property children
    @type Array
  */

  /**
    @property id
    @type String
  */

  /**
    @property type
    @type String
  */

  /**
    @property label
    @type String
  */
}

module.exports = Item;
