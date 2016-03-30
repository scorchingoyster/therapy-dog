'use strict';

const registerEach = require('./helpers/each');
const registerIf = require('./helpers/if');
const registerWith = require('./helpers/with');

exports.registerDefaultHelpers = function(arrow) {
  registerEach(arrow);
  registerIf(arrow);
  registerWith(arrow);
};
