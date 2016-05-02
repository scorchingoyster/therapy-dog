'use strict';

const Arrow = require('../../arrow');
const XML = require('../../arrow/models/xml');
const Item = require('../../bundle/item');
const File = require('../../bundle/file');
const Metadata = require('../../bundle/metadata');
const Bundle = require('../../bundle');

/**
  Generates a bundle containing a 'File' item, optionally with metadata.

  @method generateSingle
  @param {Form} form
  @param {Object} values
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
      let root = new Arrow(spec.template).evaluate(context);
      let xml = new XML(root);

      return new Metadata([xml], { type: spec.type });
    });
  } else {
    metadata = [];
  }

  let item = new Item([file].concat(metadata), { type: 'File', label: upload.name });

  return new Bundle([item], {});
};
