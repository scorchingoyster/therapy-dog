'use strict';

const Xmlbuilder = require('xmlbuilder');
const XML = require('../../lib/arrow/models/xml');
const equal = require('assert').equal;

describe('XML', function() {
  it('should render elements, attributes, and text', function() {
    let root = {
      type: 'mods',
      properties: {},
      children: [
        {
          type: 'name',
          properties: { type: 'personal' },
          children: [
            {
              type: 'namePart',
              properties: {},
              children: [
                {
                  type: '@type',
                  properties: {},
                  children: ['given']
                },
                'Someone',
                ' ',
                'Middle'
              ]
            }
          ]
        }
      ]
    };

    let xml = new XML(root);

    equal(xml.render().toString(), '<mods><name type="personal"><namePart type="given">Someone Middle</namePart></name></mods>');
  });

  it('should render using an Xmlbuilder object if given', function() {
    let root = {
      type: 'mods',
      properties: {},
      children: [
        {
          type: 'note',
          properties: {},
          children: ['This is a thing']
        }
      ]
    };

    let xml = new XML(root);

    let builder = Xmlbuilder.create('xmlData');
    xml.render(builder);

    equal(builder.toString(), '<xmlData><mods><note>This is a thing</note></mods></xmlData>');
  });
});
