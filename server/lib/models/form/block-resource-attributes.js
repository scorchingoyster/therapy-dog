'use strict';

const getOptionsResourceAttributes = require('./options').getOptionsResourceAttributes;

function optionallyGetOptionsResourceAttributes(block) {
  if (block.options) {
    return getOptionsResourceAttributes(block.options).then(function(options) {
      return Object.assign({}, block, { options });
    });
  } else {
    return block;
  }
}

exports.section = function(block, mapChildren) {
  return mapChildren(block.children).then((children) => {
    return Object.assign({}, block, { children });
  });
};

exports.text = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.email = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.orcid = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.date = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.select = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.checkboxes = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.radio = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.tokens = function(block) {
  return optionallyGetOptionsResourceAttributes(block);
};

exports.file = function(block) {
  return block;
};

exports.agreement = function(block) {
  return block;
};
