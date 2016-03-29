'use strict';

const Arrow = require('../arrow');
const Item = require('./model').Item;
const File = require('./model').File;
const Link = require('./model').Link;
const Metadata = require('./model').Metadata;
const Bundle = require('./model').Bundle;

module.exports = {
  item: Arrow.helper(function(params, hash, body) {
    return new Item(body(), hash);
  }),

  file: Arrow.helper(function(params, hash, body) {
    return new File(body(), hash);
  }),

  link: Arrow.helper(function(params, hash) {
    return new Link(hash);
  }),

  metadata: Arrow.helper(function(params, hash, body) {
    return new Metadata(body(), hash);
  }),

  document: Arrow.helper(function(params, hash, body) {
    return new Bundle(body());
  })
};
