'use strict';

module.exports = function(arrow) {
  const Arrow = require('../index');
  const isEmpty = require('../utils').isEmpty;

  arrow.registerHelper('if', Arrow.helper(function(params, hash, body, inverse) {
    let conditional = params[0];
    if (!isEmpty(conditional)) {
      return body();
    } else {
      return inverse();
    }
  }));
};
