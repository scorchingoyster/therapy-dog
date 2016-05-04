'use strict';

const Arrow = require('../../lib/arrow');
const deepEqual = require('assert').deepEqual;

describe('Evaluate', function() {
  it('should evaluate a string expression', function() {
    let template = new Arrow({ type: 'string', value: 'Lorem ipsum' });

    let context = {};

    let expected = 'Lorem ipsum';

    deepEqual(template.evaluate(context), expected);
  });

  it('should evaluate a structure expression', function() {
    let template = new Arrow({
      type: 'structure',
      name: 'namePart',
      properties: {
        type: { type: 'string', value: 'given' }
      },
      children: [
        { type: 'string', value: 'Someone' }
      ]
    });

    let context = {};

    let expected = {
      type: 'namePart',
      properties: { type: 'given' },
      children: ['Someone']
    };

    deepEqual(template.evaluate(context), expected);
  });

  it('should evaluate a lookup expression', function() {
    let template = new Arrow({ type: 'lookup', path: ['title'] });

    let context = { title: 'Lorem ipsum' };

    deepEqual(template.evaluate(context), 'Lorem ipsum');
  });

  it('should evaluate a lookup expression with a path to an undefined value', function() {
    let template = new Arrow({ type: 'lookup', path: ['affiliation'] });

    let context = {};

    deepEqual(template.evaluate(context), undefined);
  });

  it('should evaluate an each expression', function() {
    let template = new Arrow({
      type: 'each',
      items: { type: 'lookup', path: ['authors'] },
      locals: {
        item: 'author'
      },
      body: [
        { type: 'lookup', path: ['author', 'first'] }
      ]
    });

    let context = {
      authors: [
        { first: 'Someone' },
        { first: 'Another' }
      ]
    };

    let expected = ['Someone', 'Another'];

    deepEqual(template.evaluate(context), expected);
  });

  it('should evaluate an each expression which looks up something undefined', function() {
    let template = new Arrow({
      type: 'each',
      items: { type: 'lookup', path: ['authors'] },
      locals: {
        item: 'author'
      },
      body: [
        { type: 'lookup', path: ['author', 'first'] }
      ]
    });

    let context = {};

    deepEqual(template.evaluate(context), undefined);
  });

  it('should evaluate a choose expression', function() {
    let template = new Arrow({
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
    });

    deepEqual(template.evaluate({ stuff: '123', other: '456' }), ['stuff']);
    deepEqual(template.evaluate({ other: '456' }), ['other']);
    deepEqual(template.evaluate({}), ['nothing']);
  });

  it('should evaluate an arrow expression', function() {
    let template = new Arrow({
      type: 'arrow',
      items: { type: 'lookup', path: ['roles'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    });

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

    deepEqual(template.evaluate(context), expected);
  });

  it('should evaluate an arrow expression which looks up a string', function() {
    let template = new Arrow({
      type: 'arrow',
      items: { type: 'lookup', path: ['role'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    });

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

    deepEqual(template.evaluate(context), expected);
  });

  it('should evaluate an arrow expression which looks up something undefined', function() {
    let template = new Arrow({
      type: 'arrow',
      items: { type: 'lookup', path: ['role'] },
      target: [
        { type: 'structure', name: 'role' },
        { type: 'structure', name: 'roleTerm' }
      ]
    });

    let context = {};

    deepEqual(template.evaluate(context), undefined);
  });
});
