'use strict';

const checker = require('../../checker');
const optionsChecker = require('./options').optionsChecker;

exports.agreement = checker.shape({
  key: checker.string(),
  name: checker.string(),
  uri: checker.string(),
  prompt: checker.string()
});

exports.checkboxes = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.arrayOf(checker.string())),
  note: checker.optional(checker.string())
});

exports.date = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  defaultValue: checker.optional(checker.string()),
  precision: checker.optional(checker.oneOf([
    checker.literal('year'),
    checker.literal('month'),
    checker.literal('day')
  ])),
  required: checker.optional(checker.boolean()),
  note: checker.optional(checker.string())
});

exports.email = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  placeholder: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

exports.file = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  required: checker.optional(checker.boolean()),
  multiple: checker.optional(checker.boolean()),
  note: checker.optional(checker.string())
});

exports.radio = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

exports.section = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  repeat: checker.optional(checker.boolean()),
  note: checker.optional(checker.string()),
  children: checker.arrayOf(checker.lookup(exports, 'block'))
});

exports.select = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: optionsChecker,
  required: checker.optional(checker.boolean()),
  allowBlank: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

exports.text = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.string()),
  placeholder: checker.optional(checker.string()),
  size: checker.optional(checker.oneOf([
    checker.literal('line'),
    checker.literal('paragraph')
  ])),
  note: checker.optional(checker.string())
});

exports.tokens = checker.shape({
  key: checker.string(),
  label: checker.optional(checker.string()),
  options: checker.optional(optionsChecker),
  required: checker.optional(checker.boolean()),
  defaultValue: checker.optional(checker.arrayOf(checker.string())),
  placeholder: checker.optional(checker.string()),
  note: checker.optional(checker.string())
});

exports.block = checker.recordTypes({
  agreement: checker.lookup(exports, 'agreement'),
  checkboxes: checker.lookup(exports, 'checkboxes'),
  date: checker.lookup(exports, 'date'),
  email: checker.lookup(exports, 'email'),
  file: checker.lookup(exports, 'file'),
  radio: checker.lookup(exports, 'radio'),
  section: checker.lookup(exports, 'section'),
  select: checker.lookup(exports, 'select'),
  text: checker.lookup(exports, 'text'),
  tokens: checker.lookup(exports, 'tokens')
});
