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
  constructor(children) {
    children.forEach(function(child) {
      if (!(child instanceof Item)) {
        throw new TypeError('A bundle may only contain items at the top level');
      }
    });

    this.children = children;

    let itemsByFragment = this.items.reduce(function(result, item) {
      if (!result.hasOwnProperty(item.fragment)) {
        result[item.fragment] = [];
      }
      result[item.fragment].push(item);
      return result;
    }, {});

    this.links.forEach(function(link) {
      if (link.href && link.href[0] === '#') {
        link.items = itemsByFragment[link.href.slice(1)] || [];
      }
    });
  }

  get files() {
    return collectNodes(this, File);
  }

  get items() {
    return collectNodes(this, Item);
  }

  get metadata() {
    return collectNodes(this, Metadata);
  }

  get links() {
    return collectNodes(this, Link);
  }
}

module.exports = Bundle;
