'use strict';

const File = require('./file');
const Item = require('./item');
const Metadata = require('./metadata');
const Link = require('./link');

function collectNodes(parent, constructor) {
  return parent.children.reduce(function(items, child) {
    if (child instanceof constructor) {
      items = items.concat(child);
    }

    if (child instanceof Item) {
      return items.concat(collectNodes(child, constructor));
    } else {
      return items;
    }
  }, []);
}

class Bundle {
  /**
   * @param {Array<Item>} children
   */
  constructor(children) {
    children.forEach(function(child) {
      if (!(child instanceof Item)) {
        throw new TypeError('A bundle may only contain items at the top level');
      }
    });

    this.children = children;
  }

  /**
   * @name Bundle#children
   * @type {Array<Item>}
   */

  /**
   * All of the {@link File} instances in this {@link Bundle}.
   * @type {Array<File>}
   */
  get files() {
    return collectNodes(this, File);
  }

  /**
   * All of the {@link Item} instances in this {@link Bundle}.
   * @type {Array<Item>}
   */
  get items() {
    return collectNodes(this, Item);
  }

  /**
   * All of the {@link Metadata} instances in this {@link Bundle}.
   * @type {Array<Metadata>}
   */
  get metadata() {
    return collectNodes(this, Metadata);
  }

  /**
   * All of the {@link Link} instances in this {@link Bundle}.
   * @type {Array<Link>}
   */
  get links() {
    return collectNodes(this, Link);
  }
}

module.exports = Bundle;
