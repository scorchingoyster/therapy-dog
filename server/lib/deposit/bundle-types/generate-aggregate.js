'use strict';

const Arrow = require('../../arrow');
const XML = require('../../arrow/models/xml');
const Item = require('../../bundle/item');
const File = require('../../bundle/file');
const Link = require('../../bundle/link');
const Metadata = require('../../bundle/metadata');
const Bundle = require('../../bundle');

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
          let root = new Arrow(spec.template).evaluate(context);
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

function generateAgreementFileItem(agreements, values) {
  let contents = agreements.map(function(key) {
    let agreement = values[key];
    return `${agreement.name}\n${agreement.uri}\n${agreement.prompt}\n`;
  }).join('\n');

  let file = new File([contents], { mimetype: 'text/plain' });

  return new Item([file], { type: 'File', label: 'agreements.txt' });
}

/**
  Generate a bundle containing an 'Aggregate Work' item, which contains a main
  file and optional supplemental files, each optionally with metadata. The
  aggregate item is linked to the main item via the relationship defined by
  rel, if present.

  @method generateAggregate
  @param {Form} form
  @param {Object} values
*/
module.exports = function(form, values) {
  let children = [];

  let main = generateOneFileItem(form.bundle.main, form.metadata, values);
  children = children.concat(main);

  if (form.bundle.supplemental) {
    let supplemental = form.bundle.supplemental.reduce(function(result, itemSpec) {
      return result.concat(generateFileItems(itemSpec, form.metadata, values));
    }, []);
    children = children.concat(supplemental);
  }

  let link = new Link({ items: [main], rel: 'http://cdr.unc.edu/definitions/1.0/base-model.xml#defaultWebObject' });
  children = children.concat(link);

  if (form.bundle.agreements) {
    let agreement = generateAgreementFileItem(form.bundle.agreements, values);
    children = children.concat(agreement);
  }

  let aggregate = new Item(children, { type: 'Aggregate Work' });

  return new Bundle([aggregate], {});
};
