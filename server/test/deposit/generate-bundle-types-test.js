'use strict';

const assert = require('assert');
const Form = require('../../lib/models/form');
const generateBundle = require('../../lib/deposit/generate-bundle');
const Link = require('../../lib/bundle/model').Link;
const Metadata = require('../../lib/bundle/model').Metadata;
const buildTestUpload = require('./test-helpers').buildTestUpload;

describe('Bundle generation', function() {
  describe('using the "single" type', function() {
    let form = new Form('test', {
      children: [
        { type: 'text', key: 'title' },
        { type: 'file', key: 'thesis' }
      ],
      bundle: {
        type: 'single',
        upload: 'thesis',
        metadata: ['description']
      },
      metadata: [
        {
          id: 'description',
          type: 'descriptive',
          model: 'xml',
          template: {
            type: 'structure',
            name: 'mods',
            children: [
              {
                type: 'arrow',
                items: { type: 'lookup', path: ['title'] },
                target: [
                  { type: 'structure', name: 'titleInfo' },
                  { type: 'structure', name: 'title' }
                ]
              }
            ]
          }
        }
      ]
    });

    let buffer = new Buffer('lorem ipsum');
    let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);

    let values = {
      title: 'My Thesis',
      thesis: thesis
    };

    let bundle = generateBundle(form, values);
    
    it('should generate the correct number of items, files, metadata', function() {
      assert.equal(bundle.items.length, 1);
      assert.equal(bundle.files.length, 1);
      assert.equal(bundle.metadata.length, 1);
    });
    
    it('should have a "File" item at the root', function() {
      let item = bundle.children[0];
      assert.equal(item.label, 'thesis.pdf');
      assert.equal(item.type, 'File');
    });
    
    it('should make the properties from the upload available on the file', function() {
      let file = bundle.files[0];
      assert.equal(file.name, 'thesis.pdf');
      assert.equal(file.mimetype, 'application/pdf');
      assert.equal(file.contents, thesis);
      assert.equal(file.size, buffer.length);
    });
    
    it('should generate metadata for the item', function() {
      let item = bundle.children[0];
      let metadata = item.children.find(i => i instanceof Metadata);
      assert.equal(metadata.type, 'descriptive');
      assert.equal(metadata.contents.render().toString(), '<mods><titleInfo><title>My Thesis</title></titleInfo></mods>');
    });
  });
});
