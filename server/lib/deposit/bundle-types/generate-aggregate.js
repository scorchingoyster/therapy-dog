'use strict';

const Arrow = require('../../arrow2');
const XML = require('../../arrow2/models/xml');
const Item = require('../../bundle/model').Item;
const File = require('../../bundle/model').File;
const Link = require('../../bundle/model').Link;
const Metadata = require('../../bundle/model').Metadata;
const Bundle = require('../../bundle/model').Bundle;

/*

Generates a bundle containing an 'Aggregate Work' item, which contains a main file and optional supplemental files, each optionally with metadata. The aggregate item is linked to the main item via the relationship defined by rel, if present.

The bundle specification looks like this:

  {
    type: 'aggregate',
    rel: String?,
    main: {
      context: String?,
      upload: String,
      metadata: [String]?
    },
    supplemental: {
      context: String?,
      upload: String,
      metadata: [String]?
    }?
  }

*/

function toArray(array) {
  if (Array.isArray(array)) {
    return array;
  } else if (array === undefined) {
    return [];
  } else {
    return [array];
  }
}

function generateFileItems(itemSpec, metadataSpecs, values) {
  let contexts;
  if (itemSpec.context) {
    contexts = toArray(values[itemSpec.context]);
  } else {
    contexts = toArray(values);
  }
  
  return contexts.reduce(function(result, context) {
    let uploads = toArray(context[itemSpec.upload]);
    
    let items = uploads.map(function(upload) {
      let file = new File([upload], {});
    
      let metadata;
      if (itemSpec.metadata) {
        metadata = itemSpec.metadata.map(function(id) {
          let spec = metadataSpecs.find(m => m.id === id);
          let root = Arrow.evaluate(spec.template, context);
          let xml = new XML(root);
    
          return new Metadata([xml], { type: spec.type });
        });
      } else {
        metadata = [];
      }
    
      return new Item([file].concat(metadata), { type: 'File', label: upload.name });
    });
    
    return result.concat(items);
  }, []);
}

function generateOneFileItem(itemSpec, metadataSpecs, values) {
  let items = generateFileItems(itemSpec, metadataSpecs, values);
  
  if (items.length !== 1) {
    throw new Error('Expected item spec to generate exactly one item, instead got ' + items.length);
  }
  
  return items[0];
}

module.exports = function(form, values) {
  let main = generateOneFileItem(form.bundle.main, form.metadata, values);
  
  let supplemental;
  if (form.bundle.supplemental) {
    supplemental = form.bundle.supplemental.reduce(function(result, itemSpec) {
      return result.concat(generateFileItems(itemSpec, form.metadata, values));
    }, []);
  } else {
    supplemental = [];
  }
  
  let link = new Link({ items: [main], rel: 'http://cdr.unc.edu/definitions/1.0/base-model.xml#defaultWebObject' });
  
  let children = [main, link].concat(supplemental);
  
  let aggregate = new Item(children, { type: 'Aggregate Work' });
  
  return new Bundle([aggregate], {});
}
