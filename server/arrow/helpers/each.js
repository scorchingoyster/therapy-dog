'use strict';

module.exports = function(arrow) {
  var Arrow = require('../index');
  var isEmpty = require('../utils').isEmpty;
  
  arrow.registerHelper('each', Arrow.helper(function(params, hash, body, inverse) {
    var items = params[0];
    if (!isEmpty(items)) {
      if (Array.isArray(items)) {
        return items.reduce(function(result, item, index) {
          return result.concat(body(item, index));
        }, []);
      } else {
        return body(items, 0);
      }
    } else {
      return inverse();
    }
  }));
};
