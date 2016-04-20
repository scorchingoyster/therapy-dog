'use strict';

const Arrow = require('../../lib/arrow');
const deepEqual = require('assert').deepEqual;

describe('Compact', function() {
  describe('with lookup nodes', function() {
    let expression = {
      type: 'structure',
      name: 'mods',
      compact: true,
      children: [
        {
          type: 'structure',
          name: 'originInfo',
          children: [
            {
              type: 'structure',
              name: 'dateIssued',
              children: [
                { type: 'lookup', path: ['pubdate'] }
              ]
            },
            {
              type: 'structure',
              name: 'edition',
              children: [
                { type: 'lookup', path: ['version'] }
              ]
            }
          ]
        }
      ]
    };

    it('should remove children with all absent data', function() {
      let context = {};

      let expected = {
        type: 'mods',
        properties: {},
        children: []
      };

      deepEqual(Arrow.evaluate(expression, context), expected);
    });

    it('should consider empty strings absent data', function() {
      let context = { pubdate: '', version: '' };

      let expected = {
        type: 'mods',
        properties: {},
        children: []
      };

      deepEqual(Arrow.evaluate(expression, context), expected);
    });

    it('should not remove children with both present and absent data', function() {
      let context = { pubdate: '2016' };

      let expected = {
        type: 'mods',
        properties: {},
        children: [
          {
            type: 'originInfo',
            properties: {},
            children: [
              {
                type: 'dateIssued',
                properties: {},
                children: ['2016']
              },
              {
                type: 'edition',
                properties: {},
                children: []
              }
            ]
          }
        ]
      };

      deepEqual(Arrow.evaluate(expression, context), expected);
    });
  });

  it('should compact at multiple levels if specified', function() {
    let expression = {
      type: 'structure',
      name: 'mods',
      compact: true,
      children: [
        {
          type: 'structure',
          name: 'originInfo',
          compact: true,
          children: [
            {
              type: 'structure',
              name: 'dateIssued',
              children: [
                { type: 'lookup', path: ['pubdate'] }
              ]
            },
            {
              type: 'structure',
              name: 'edition',
              children: [
                { type: 'lookup', path: ['version'] }
              ]
            }
          ]
        }
      ]
    };

    let context = { pubdate: '2016' };

    let expected = {
      type: 'mods',
      properties: {},
      children: [
        {
          type: 'originInfo',
          properties: {},
          children: [
            {
              type: 'dateIssued',
              properties: {},
              children: ['2016']
            }
          ]
        }
      ]
    };

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should remove structures containing only strings and absent data', function() {
    let expression = {
      type: 'structure',
      name: 'mods',
      compact: true,
      children: [
        {
          type: 'structure',
          name: 'name',
          children: [
            {
              type: 'structure',
              name: 'namePart',
              properties: {
                type: { type: 'string', value: 'given' }
              },
              children: [
                { type: 'lookup', path: ['first'] }
              ]
            },
            {
              type: 'structure',
              name: 'role',
              children: [
                {
                  type: 'structure',
                  name: 'roleTerm',
                  children: [
                    { type: 'string', value: 'Author' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    let context = {};

    let expected = {
      type: 'mods',
      properties: {},
      children: []
    };

    deepEqual(Arrow.evaluate(expression, context), expected);
  });

  it('should not remove structures containing only strings', function() {
    let expression = {
      type: 'structure',
      name: 'mods',
      compact: true,
      children: [
        {
          type: 'structure',
          name: 'accessCondition',
          children: [
            { type: 'string', value: 'Some license...' }
          ]
        }
      ]
    };

    let context = {};

    let expected = {
      type: 'mods',
      properties: {},
      children: [
        {
          type: 'accessCondition',
          properties: {},
          children: ['Some license...']
        }
      ]
    };

    deepEqual(Arrow.evaluate(expression, context), expected);
  });
});
