'use strict';

const checker = require('../../checker');

const DURATION_REGEXP = /^P.+$/;
const DATE_YEAR_REGEXP = /^\d{4}$/;
const DATE_MONTH_REGEXP = /^\d{4}-\d{2}$/;
const DATE_DAY_REGEXP = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

exports.agreement = function(block) {
  return checker.literal(true);
};

exports.checkboxes = function(block) {
  let inputChecker = checker.arrayOf(checker.string());

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.date = function(block) {
  let inputChecker;
  if (block.options) {
    inputChecker = checker.regexp(DURATION_REGEXP);
  } else if (block.precision === 'year') {
    inputChecker = checker.regexp(DATE_YEAR_REGEXP);
  } else if (block.precision === 'month') {
    inputChecker = checker.regexp(DATE_MONTH_REGEXP);
  } else {
    inputChecker = checker.regexp(DATE_DAY_REGEXP);
  }

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.email = function(block) {
  let inputChecker = checker.regexp(EMAIL_REGEXP);

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.file = function(block) {
  let inputChecker;
  if (block.multiple) {
    inputChecker = checker.arrayOf(checker.string());
  } else {
    inputChecker = checker.string();
  }

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.radio = function(block) {
  let inputChecker = checker.string();

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.section = function(block, mapChildren) {
  let inputChecker = checker.shape(block.children.reduce(function(result, child) {
    return Object.assign(result, { [child.key]: exports[child.type](child) });
  }, {}));

  if (block.repeat) {
    return checker.arrayOf(inputChecker);
  } else {
    return inputChecker;
  }
};

exports.select = function(block) {
  let inputChecker = checker.string();

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};

exports.text = function(block) {
  let inputChecker = checker.string();

  if (block.required) {
    return inputChecker;
  } else {
    return checker.optional(inputChecker);
  }
};
