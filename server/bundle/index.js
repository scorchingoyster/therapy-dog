'use strict';

var Arrow = require('../arrow');
var Item = require('./model').Item;
var File = require('./model').File;
var Link = require('./model').Link;
var Metadata = require('./model').Metadata;
var Bundle = require('./model').Bundle;

module.exports = {
  item: Arrow.helper(function(params, hash, body) {
    return new Item(body(), hash);
  }),

  file: Arrow.helper(function(params, hash, body) {
    return new File(body(), hash);
  }),

  link: Arrow.helper(function(params, hash, body) {
    return new Link(hash);
  }),

  metadata: Arrow.helper(function(params, hash, body) {
    return new Metadata(body(), hash);
  }),
  
  document: Arrow.helper(function(params, hash, body) {
    return new Bundle(body());
  })
};
