'use strict';

const Arrow = require('../../lib/arrow2');
const deepEqual = require('assert').deepEqual;

describe('Evaluate', function() {
  it('should evaluate a string expression', function() {
    let expression = { type: 'string', value: 'Lorem ipsum' };

    let context = {};

    let expected = 'Lorem ipsum';

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should evaluate a structure expression', function() {
    let expression = {
      type: 'structure',
      name: 'namePart',
      properties: {
        type: { type: 'string', value: 'given' }
      },
      children: [
        { type: 'string', value: 'Someone' }
      ]
    };

    let context = {};

    let expected = {
      type: 'namePart',
      properties: { type: 'given' },
      children: ['Someone']
    };

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should evaluate a lookup expression', function() {
    let expression = { type: 'lookup', path: ['title'] };

    let context = { title: 'Lorem ipsum' };

    deepEqual(Arrow.evaluate(expression, context), 'Lorem ipsum');
  });

  it('should evaluate a lookup expression with a path to an undefined value', function() {
    let expression = { type: 'lookup', path: ['affiliation'] };

    let context = {};

    deepEqual(Arrow.evaluate(expression, context), undefined);
  });

  it('should evaluate an each expression', function() {
    let expression = {
      type: 'each',
      items: { type: 'lookup', path: ['authors'] },
      locals: {
        item: 'author'
      },
      body: [
        { type: 'lookup', path: ['author', 'first'] }
      ]
    };

    let context = {
      authors: [
        { first: 'Someone' },
        { first: 'Another' }
      ]
    };

    let expected = ['Someone', 'Another'];

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should evaluate an each expression which looks up something undefined', function() {
    let expression = {
      type: 'each',
      items: { type: 'lookup', path: ['authors'] },
      locals: {
        item: 'author'
      },
      body: [
        { type: 'lookup', path: ['author', 'first'] }
      ]
    };

    let context = {};

    deepEqual(Arrow.evaluate(expression, context), undefined);
  });

  it('should evaluate a choose expression', function() {
    let expression = {
      type: 'choose',
      choices: [
        {
          predicates: [
            { name: 'present', value: { type: 'lookup', path: ['stuff'] } }
          ],
          body: [
            { type: 'string', value: 'stuff' }
          ]
        },
        {
          predicates: [
            { name: 'present', value: { type: 'lookup', path: ['other'] } }
          ],
          body: [
            { type: 'string', value: 'other' }
          ]
        }
      ],
      otherwise: [
        { type: 'string', value: 'nothing' }
      ]
    };

    deepEqual(Arrow.evaluate(expression, { stuff: '123', other: '456' }), ['stuff']);
    deepEqual(Arrow.evaluate(expression, { other: '456' }), ['other']);
    deepEqual(Arrow.evaluate(expression, {}), ['nothing']);
  });

  it('should evaluate an arrow expression', function() {
    let expression = {
      type: 'arrow',
      items: { type: 'lookup', path: ['roles'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    };

    let context = { roles: ['Author', 'Editor'] };

    let expected = [
      {
        type: 'role',
        properties: {},
        children: [
          {
            type: 'roleTerm',
            properties: {},
            children: ['Author']
          }
        ]
      },
      {
        type: 'role',
        properties: {},
        children: [
          {
            type: 'roleTerm',
            properties: {},
            children: ['Editor']
          }
        ]
      }
    ];

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should evaluate an arrow expression which looks up a string', function() {
    let expression = {
      type: 'arrow',
      items: { type: 'lookup', path: ['role'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    };

    let context = { role: 'Author' };

    let expected = [
      {
        type: 'role',
        properties: {},
        children: [
          {
            type: 'roleTerm',
            properties: {},
            children: ['Author']
          }
        ]
      }
    ];

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should evaluate an arrow expression which looks up something undefined', function() {
    let expression = {
      type: 'arrow',
      items: { type: 'lookup', path: ['role'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    };

    let context = {};

    deepEqual(Arrow.evaluate(expression, context), undefined);
  });
});
