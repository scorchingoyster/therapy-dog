'use strict';

const assert = require('assert');
const Promise = require('bluebird');
const blockInputCheckers = require('../../../lib/models/form/block-input-checkers');

function checkInput(block, value) {
  return blockInputCheckers[block.type](block)(value);
}

describe('Block input checkers', function() {
  it('should check input for an agreement block', function() {
    let block = {
      type: 'agreement'
    };

    assert.deepEqual(checkInput(block, true), true);
    assert.throws(() => { checkInput(block, false); });
  });

  it('should check input for a checkboxes block', function() {
    let block = {
      type: 'checkboxes'
    };

    assert.deepEqual(checkInput(block, ['abc']), ['abc']);
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, 'abc'); });
  });

  it('should check input for a date block', function() {
    let block = {
      type: 'date'
    };

    assert.deepEqual(checkInput(block, '2016-01-01'), '2016-01-01');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, '2016'); });
  });

  it('should check input for a date block with month precision', function() {
    let block = {
      type: 'date',
      precision: 'month'
    };

    assert.deepEqual(checkInput(block, '2016-01'), '2016-01');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, '2016'); });
  });

  it('should check input for a date block with options', function() {
    let block = {
      type: 'date',
      options: ['P1Y', 'P2Y']
    };

    assert.deepEqual(checkInput(block, 'P1Y'), 'P1Y');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, '2016'); });
  });

  it('should check input for a email block', function() {
    let block = {
      type: 'email'
    };

    assert.deepEqual(checkInput(block, 'x@y.com'), 'x@y.com');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, 'asdf'); });
  });

  it('should check input for a file block', function() {
    let block = {
      type: 'file'
    };

    assert.deepEqual(checkInput(block, 'abcd'), 'abcd');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, { id: 'abcd' }); });
  });

  it('should check input for a multiple file block', function() {
    let block = {
      type: 'file',
      multiple: true
    };

    assert.deepEqual(checkInput(block, ['abcd', 'efgh']), ['abcd', 'efgh']);
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, 'abcd'); });
  });

  it('should check input for a radio block', function() {
    let block = {
      type: 'radio'
    };

    assert.deepEqual(checkInput(block, 'CC-BY'), 'CC-BY');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, ['CC-BY']); });
  });

  it('should check input for a section block', function() {
    let block = {
      type: 'section',
      children: [
        {
          type: 'text',
          key: 'text'
        }
      ]
    };

    assert.deepEqual(checkInput(block, { text: 'abc' }), { text: 'abc' });
    assert.deepEqual(checkInput(block, { text: 'abc', blah: 123 }), { text: 'abc' });
    assert.throws(() => { checkInput(block, undefined); });
    assert.throws(() => { checkInput(block, [{ text: 'abc' }]); });
  });

  it('should check input for a repeating section block', function() {
    let block = {
      type: 'section',
      repeat: true,
      children: [
        {
          type: 'text',
          key: 'text'
        }
      ]
    };

    assert.deepEqual(checkInput(block, [{ text: 'abc' }, { text: '123' }]), [{ text: 'abc' }, { text: '123' }]);
    assert.throws(() => { checkInput(block, undefined); });
    assert.throws(() => { checkInput(block, { text: 'abc' }); });
  });

  it('should check input for a select block', function() {
    let block = {
      type: 'select'
    };

    assert.deepEqual(checkInput(block, 'abc'), 'abc');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, ['abc']); });
  });

  it('should check input for a text block', function() {
    let block = {
      type: 'text'
    };

    assert.deepEqual(checkInput(block, 'abc'), 'abc');
    assert.deepEqual(checkInput(block, undefined), undefined);
    assert.throws(() => { checkInput(block, ['abc']); });
  });

  it('should check input for a required text block', function() {
    let block = {
      type: 'text',
      required: true
    };

    assert.deepEqual(checkInput(block, 'abc'), 'abc');
    assert.throws(() => { checkInput(block, undefined); });
    assert.throws(() => { checkInput(block, ['abc']); });
  });
});
