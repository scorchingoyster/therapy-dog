'use strict';

const Arrow = require('../../arrow2');
const XML = require('../../arrow2/models/xml');
const Item = require('../../bundle/model').Item;
const File = require('../../bundle/model').File;
const Link = require('../../bundle/model').Link;
const Metadata = require('../../bundle/model').Metadata;
const Bundle = require('../../bundle/model').Bundle;

function findValues(object, key) {
  if (key in object) {
    return [object[key]];
  } else {
    return Object.keys(object).reduce(function(result, k) {
      if (Array.isArray(object[k])) {
        return result.concat(object[k].map(o => findValues(o, key)));
      } else if (typeof object[k] === 'object') {
        return result.concat(findValues(object[k], key));
      } else {
        return result;
      }
    }, []);
  }
}

module.exports = function(form, values) {
  let uploads = findValues(values, form.bundle.upload);
  let upload = uploads[0];
  
  let file = new File([upload], {});
  
  let metadata = form.bundle.metadata.map(function(id) {
    let spec = form.metadata.find(m => m.id === id);
    let root = Arrow.evaluate(spec.template, values);
    let xml = new XML(root);

    return new Metadata([xml], { type: spec.type });
  });
  
  let item = new Item([file].concat(metadata), { type: 'File', label: upload.name });
  
  return new Bundle([item], {});
}
