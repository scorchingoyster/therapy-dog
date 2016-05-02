'use strict';

class Link {
  constructor(options) {
    this.items = options.items;
    this.href = options.href;
    this.rel = options.rel;
  }
}

module.exports = Link;
