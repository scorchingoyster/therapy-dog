'use strict';

var registerEach = require('./helpers/each');
var registerIf = require('./helpers/if');
var registerWith = require('./helpers/with');

module.exports.registerDefaultHelpers = function(arrow) {
  registerEach(arrow);
  registerIf(arrow);
  registerWith(arrow);
}
