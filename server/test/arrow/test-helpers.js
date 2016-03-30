'use strict';

const Arrow = require('../../lib/arrow');

exports.registerTestHelpers = function(arrow) {
  arrow.registerHelper('repeat', Arrow.helper(function(params, hash, body) {
    let count = params[0];
    let value = body();
    let result = [];
    while (count--) {
      result = result.concat(value);
    }
    return result;
  }));

  arrow.registerHelper('contrary', Arrow.helper(function(params, hash, body, inverse) {
    return inverse();
  }));

  arrow.registerHelper('concat', Arrow.helper(function(items) {
    return items.join('');
  }));

  arrow.registerHelper('element', Arrow.helper(function(params, attributes, body) {
    let name = params[0];
    attributes = attributes === undefined ? {} : attributes;
    return {
      type: 'element',
      name: name,
      attributes: attributes,
      children: body()
    };
  }));

  arrow.registerHelper('echo', Arrow.helper(function(params, hash, body) {
    return {
      type: 'echo',
      body: body()
    };
  }));

  arrow.registerHelper('params-are-data', Arrow.helper(function(params) {
    let value = params.map(function(v) { return v.data; });
    let data = value.some(function(d) { return d; });

    return { value: value, data: data };
  }, { raw: true }));

  arrow.registerHelper('hash-values-are-data', Arrow.helper(function(params, hash) {
    let value = Object.keys(hash).reduce(function(h, k) {
      h[k] = hash[k].data;
      return h;
    }, {});
    let data = Object.keys(value).some(function(k) { return value[k]; });

    return { value: value, data: data };
  }, { raw: true }));

  arrow.registerHelper('body-is-data', Arrow.helper(function(params, hash, body) {
    let result = body();

    return { value: result.data, data: result.data };
  }, { raw: true }));
};
