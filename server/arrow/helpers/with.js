'use strict';

module.exports = function(arrow) {
  const Arrow = require('../index');
  const isEmpty = require('../utils').isEmpty;
  
  arrow.registerHelper('with', Arrow.helper(function(params, hash, body, inverse) {
    let value = params[0];
    if (!isEmpty(value)) {
      return body(value);
    } else {
      return inverse();
    }
  }));
};
