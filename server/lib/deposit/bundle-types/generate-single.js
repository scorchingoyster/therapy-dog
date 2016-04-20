'use strict';

const Arrow = require('../../arrow2');
const XML = require('../../arrow2/models/xml');
const Item = require('../../bundle/model').Item;
const File = require('../../bundle/model').File;
const Link = require('../../bundle/model').Link;
const Metadata = require('../../bundle/model').Metadata;
const Bundle = require('../../bundle/model').Bundle;

/*

Generates a bundle containing a 'File' item, optionally with metadata.

The bundle specification looks like this:

  {
    type: 'single',
    context: String?
    upload: String,
    metadata: [String]?
  }

A metadata specification looks like this:

  {
    id: String,
    type: String,
    model: String,
    template: Object
  }

*/

module.exports = function(form, values) {
  let context;
  if (form.bundle.context) {
    context = values[form.bundle.context];
  } else {
    context = values;
  }
  
  let upload = context[form.bundle.upload];

  let file = new File([upload], {});

  let metadata;
  if (form.bundle.metadata) {
    metadata = form.bundle.metadata.map(function(id) {
      let spec = form.metadata.find(m => m.id === id);
      let root = Arrow.evaluate(spec.template, context);
      let xml = new XML(root);
    
      return new Metadata([xml], { type: spec.type });
    });
  } else {
    metadata = [];
  }
  
  let item = new Item([file].concat(metadata), { type: 'File', label: upload.name });
  
  return new Bundle([item], {});
}
