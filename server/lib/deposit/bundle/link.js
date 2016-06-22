'use strict';

class Link {
  /**
   * @param {Item} target
   * @param {String} rel
   */
  constructor(target, rel) {
    this.target = target;
    this.rel = rel;
  }

  /**
   * @name Link#target
   * @type Item
   */

  /**
   * @name Link#rel
   * @type String
   */
}

module.exports = Link;
