'use strict';

var crypto = require('crypto');
var fs = require('fs');
var uuid = require('uuid');
var Upload = require('../models/upload');
var XMLElement = require('../arrow/documents/xml/model').XMLElement;
var inspect = require('util').inspect;

function Item(children, options) {
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

module.exports.Item = Item;

function File(children, options) {
  if (children.length === 1 && children[0] instanceof Upload) {
    this.contents = children[0];
  } else {
    this.contents = Buffer.concat(children.map(function(child) {
      var type = Object.prototype.toString.call(child);
    
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

Object.defineProperty(File.prototype, 'isUpload', {
  get: function() {
    return this.contents instanceof Upload;
  }
});

Object.defineProperty(File.prototype, 'isBuffer', {
  get: function() {
    return this.contents instanceof Buffer;
  }
});

Object.defineProperty(File.prototype, 'name', {
  get: function() {
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
});

Object.defineProperty(File.prototype, 'mimetype', {
  get: function() {
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
});

Object.defineProperty(File.prototype, 'size', {
  get: function() {
    if (this.isUpload) {
      return this.contents.size;
    } else {
      return this.contents.length;
    }
  }
});

File.prototype.getHashDigest = function(algorithm, encoding) {
  if (this.isUpload) {
    var path = this.contents.path;

    return new Promise(function(resolve, reject) {
      var hash = crypto.createHash(algorithm);
      var input = fs.createReadStream(path);

      input.on('end', function() {
        hash.end();
        resolve(hash.read().toString(encoding));
      });

      input.pipe(hash);
    });
  } else {
    var buffer = this.contents;
  
    return new Promise(function(resolve, reject) {
      var hash = crypto.createHash(algorithm);
      hash.update(buffer);
      resolve(hash.digest(encoding));
    });
  }
}

module.exports.File = File;

function Metadata(children, options) {
  if (children.length === 1 && children[0] instanceof XMLElement) {
    this.contents = children[0];
  } else {
    throw new Error('Metadata must contain a single XML element.');
  }

  this.id = '_' + uuid.v4();
  this.type = options.type;
}

Object.defineProperty(Metadata.prototype, 'isXML', {
  get: function() {
    return true;
  }
});

module.exports.Metadata = Metadata;

function Link(options) {
  this.href = options.href;
  this.rel = options.rel;
}

module.exports.Link = Link;

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

function Bundle(children) {
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
    if (link.href[0] === "#") {
      link.items = itemsByFragment[link.href.slice(1)] || [];
    }
  });
}

Object.defineProperty(Bundle.prototype, 'files', {
  get: function() {
    return collectNodes(this, File);
  }
});

Object.defineProperty(Bundle.prototype, 'items', {
  get: function() {
    return collectNodes(this, Item);
  }
});

Object.defineProperty(Bundle.prototype, 'metadata', {
  get: function() {
    return collectNodes(this, Metadata);
  }
});
  
Object.defineProperty(Bundle.prototype, 'links', {
  get: function() {
    return collectNodes(this, Link);
  }
});

module.exports.Bundle = Bundle;
