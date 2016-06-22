'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const Upload = require('../upload');
const getOptionTerm = require('./options').getOptionTerm;

const DURATION_REGEX = /^P.+$/;

exports.section = function(block, value, reduceChildren) {
  if (block.repeat) {
    return Promise.all(value.map(item => reduceChildren(block.children, item, {})));
  } else {
    return reduceChildren(block.children, value, {});
  }
};

exports.text = function(block, value) {
  return String(value);
};

exports.email = function(block, value) {
  return String(value);
};

exports.date = function(block, value) {
  if (DURATION_REGEX.test(value)) {
    return moment().add(moment.duration(value)).format('YYYY-MM-DD');
  } else {
    return String(value);
  }
};

exports.select = function(block, value) {
  return getOptionTerm(block.options, value);
};

exports.checkboxes = function(block, value) {
  if (Array.isArray(value)) {
    return Promise.all(value.map(function(v) {
      return getOptionTerm(block.options, v);
    })).then(function(terms) {
      return terms.filter(t => t !== undefined);
    });
  } else {
    return [];
  }
};

exports.radio = function(block, value) {
  return getOptionTerm(block.options, value);
};

exports.file = function(block, value) {
  if (block.multiple) {
    return Promise.all(value.map(function(v) {
      return Upload.findById(v);
    }));
  } else {
    return Upload.findById(value);
  }
};

exports.agreement = function(block, value) {
  if (value) {
    return { name: block.name, uri: block.uri, prompt: block.prompt };
  }
};
