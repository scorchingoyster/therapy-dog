'use strict';

const crypto = require('crypto');
const fs = require('fs');
const uuid = require('uuid');
const Upload = require('../models/upload');
const XML = require('../arrow/models/xml');

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

exports.Item = Item;

class File {
  constructor(children, options) {
    if (children.length === 1 && children[0] instanceof Upload) {
      this.contents = children[0];
    } else {
      this.contents = Buffer.concat(children.map(function(child) {
        let type = Object.prototype.toString.call(child);

        if (type !== '[object String]' && type !== '[object Number]') {
          throw new Error('A file must contain either a single Upload, or zero or more strings or numbers.');
        }

        return new Buffer(String(child));
      }));
    }

    this.id = '_' + uuid.v4();
    this._name = options.name;
    this._mimetype = options.mimetype;
  }

  get isUpload() {
    return this.contents instanceof Upload;
  }

  get isBuffer() {
    return this.contents instanceof Buffer;
  }

  get name() {
    if (this._name) {
      return this._name;
    } else {
      if (this.isUpload) {
        return this.contents.name;
      } else {
        return 'untitled.txt';
      }
    }
  }

  get mimetype() {
    if (this._mimetype) {
      return this._mimetype;
    } else {
      if (this.isUpload) {
        return this.contents.type;
      } else {
        return 'text/plain';
      }
    }
  }

  get size() {
    if (this.isUpload) {
      return this.contents.size;
    } else {
      return this.contents.length;
    }
  }

  getHashDigest(algorithm, encoding) {
    if (this.isUpload) {
      let path = this.contents.path;

      return new Promise(function(resolve) {
        let hash = crypto.createHash(algorithm);
        let input = fs.createReadStream(path);

        input.on('end', function() {
          hash.end();
          resolve(hash.read().toString(encoding));
        });

        input.pipe(hash);
      });
    } else {
      let buffer = this.contents;

      return new Promise(function(resolve) {
        let hash = crypto.createHash(algorithm);
        hash.update(buffer);
        resolve(hash.digest(encoding));
      });
    }
  }
}

exports.File = File;

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

exports.Metadata = Metadata;

class Link {
  constructor(options) {
    this.items = options.items;
    this.href = options.href;
    this.rel = options.rel;
  }
}

exports.Link = Link;

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
        throw new Error('A bundle may only contain items at the top level.');
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

exports.Bundle = Bundle;
