'use strict';

module.exports = function(arrow) {
  var Arrow = require('../index');
  var isEmpty = require('../utils').isEmpty;
  
  arrow.registerHelper('if', Arrow.helper(function(params, hash, body, inverse) {
    var conditional = params[0];
    if (!isEmpty(conditional)) {
      return body();
    } else {
      return inverse();
    }
  }));
};
