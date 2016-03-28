'use strict';

module.exports = function(arrow) {
  var Arrow = require('../index');
  var isEmpty = require('../utils').isEmpty;
  
  arrow.registerHelper('with', Arrow.helper(function(params, hash, body, inverse) {
    var value = params[0];
    if (!isEmpty(value)) {
      return body(value);
    } else {
      return inverse();
    }
  }));
};
