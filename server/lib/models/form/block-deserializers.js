'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const Upload = require('../upload');
const getOptionTerm = require('./options').getOptionTerm;

const DURATION_REGEXP = /^P.+$/;

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

exports.orcid = function(block, value) {
  let formattedOrcidValue;

  if (value === '') {
    formattedOrcidValue = '';
  } else {
    let urlPrefix = value.match(/^https?/);
    let isSslRegex = /^https/;

    if (urlPrefix === null && !/orcid\.org/.test(value)) {
      formattedOrcidValue = `http://orcid.org/${value}`;
    } else if (urlPrefix === null) {
      formattedOrcidValue = `http://${value}`;
    } else {
      formattedOrcidValue = (isSslRegex.test(urlPrefix[0])) ? value.replace(isSslRegex, 'http') : value;
    }
  }

  return String(formattedOrcidValue);
};

exports.date = function(block, value) {
  if (DURATION_REGEXP.test(value)) {
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
    if (Array.isArray(value)) {
      return Promise.all(value.map(function(v) {
        if (typeof v === 'string') {
          return Upload.findById(v);
        } else {
          return undefined;
        }
      }));
    } else {
      return [];
    }
  } else {
    if (typeof value === 'string') {
      return Upload.findById(value);
    } else {
      return undefined;
    }
  }
};

exports.agreement = function(block, value) {
  if (value) {
    return { name: block.name, uri: block.uri, prompt: block.prompt };
  }
};

exports.tokens = function(block, value) {
  if (Array.isArray(value)) {
    return value;
  } else {
    return [];
  }
};
