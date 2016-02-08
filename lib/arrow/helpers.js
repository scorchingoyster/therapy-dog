var utils = require('./utils');
var isData = utils.isData;
var wrapData = utils.wrapData;
var unwrapData = utils.unwrapData;
var isEmpty = utils.isEmpty;
var eachValue = utils.eachValue;
var toArray = utils.toArray;

function eachHelper(params, hash, content) {
  var result = [];
  
  eachValue(params[0], function(value, index) {
    result = result.concat(content.body(value, index));
  });
  
  return result;
}

function ifHelper(params, hash, content) {
  var value = unwrapData(params[0]);
  
  if (!isEmpty(value)) {
    return content.body();
  } else {
    return content.inverse();
  }
}

function withHelper(params, hash, content) {
  if (!isEmpty(unwrapData(params[0]))) {
    return content.body(params[0]);
  } else {
    return content.inverse();
  }
}

module.exports = {
  each: eachHelper,
  if: ifHelper,
  with: withHelper
};
