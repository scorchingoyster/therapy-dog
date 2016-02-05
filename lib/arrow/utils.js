function isData(value) {
  return value && value.type === 'data';
}

function unwrapData(maybeData) {
  if (isData(maybeData)) {
    return maybeData.value;
  } else {
    return maybeData;
  }
}

function wrapData(value) {
  return { type: 'data', value: value };
}

function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (Array.isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

function eachValue(values, callback) {
  var list = unwrapData(values);
  var data = isData(values);
  
  if (Array.isArray(list)) {
    list.forEach(function(item, index) {
      if (isEmpty(item)) {
        return;
      } else if (data) {
        callback(wrapData(item), index);
      } else {
        callback(item, index);
      }
    });
  } else {
    if (isEmpty(list)) {
      return;
    } else if (data) {
      callback(wrapData(list), 0);
    } else {
      callback(list, 0);
    }
  }
}

function toArray(arr) {
  return Array.isArray(arr) ? arr : [arr];
}

module.exports = {
  isData: isData,
  unwrapData: unwrapData,
  wrapData: wrapData,
  isEmpty: isEmpty,
  eachValue: eachValue,
  toArray: toArray
};
