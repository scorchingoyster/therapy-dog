'use strict';

const uuid = require('uuid');
const File = require('./file');
const Metadata = require('./metadata');
const Link = require('./link');

class Item {
  constructor(children, options) {
    children.forEach(function(child) {
      if (!(child instanceof Item || child instanceof File || child instanceof Metadata || child instanceof Link)) {
        throw new Error('An item may only contain items, files, metadata, and links.');
      }
    });

    this.children = children;
    this.id = '_' + uuid.v4();
    this.type = options.type;
    this.label = options.label;
    this.fragment = options.fragment;
  }
}

module.exports = Item;
