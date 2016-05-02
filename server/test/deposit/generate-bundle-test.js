'use strict';

const assert = require('assert');
const Form = require('../../lib/models/form');
const generateBundle = require('../../lib/deposit/generate-bundle');
const Link = require('../../lib/deposit/bundle/link');
const Metadata = require('../../lib/deposit/bundle/metadata');
const File = require('../../lib/deposit/bundle/file');
const buildTestUpload = require('./test-helpers').buildTestUpload;

describe('Bundle generation', function() {
  describe('using the "single" type', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
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

  describe('using the "aggregate" type', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      children: [
        { type: 'text', key: 'title' },
        { type: 'file', key: 'thesis' },
        { type: 'file', key: 'supplemental', multiple: true }
      ],
      bundle: {
        type: 'aggregate',
        main: {
          upload: 'thesis',
          metadata: ['description']
        },
        supplemental: [
          {
            upload: 'supplemental'
          }
        ]
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
    let dataset = buildTestUpload('dataset.csv', 'text/csv', buffer);
    let appendix = buildTestUpload('appendix.pdf', 'application/pdf', buffer);

    let values = {
      title: 'My Thesis',
      thesis: thesis,
      supplemental: [dataset, appendix]
    };

    let bundle = generateBundle(form, values);

    it('should generate the correct number of items, files, metadata', function() {
      assert.equal(bundle.items.length, 4);
      assert.equal(bundle.files.length, 3);
      assert.equal(bundle.metadata.length, 1);
    });

    it('should have an "Aggregate Work" item at the root', function() {
      let aggregate = bundle.children[0];
      assert.equal(aggregate.type, 'Aggregate Work');
    });

    it('should have "File" items under the "Aggregate Work" item', function() {
      let aggregate = bundle.children[0];
      assert.ok(aggregate.children.find(i => i.type === 'File' && i.label === 'thesis.pdf'));
      assert.ok(aggregate.children.find(i => i.type === 'File' && i.label === 'dataset.csv'));
      assert.ok(aggregate.children.find(i => i.type === 'File' && i.label === 'appendix.pdf'));
    });

    it('should have a link from the "Aggregate Work" item to the main "File" item', function() {
      let aggregate = bundle.children[0];
      let main = aggregate.children.find(i => i.label === 'thesis.pdf');
      let link = aggregate.children.find(i => i instanceof Link);
      assert.equal(link.rel, 'http://cdr.unc.edu/definitions/1.0/base-model.xml#defaultWebObject');
      assert.deepEqual(link.items, [main]);
    });

    it('should generate metadata for the main item', function() {
      let main = bundle.items.find(i => i.label === 'thesis.pdf');
      let metadata = main.children.find(i => i instanceof Metadata);
      assert.equal(metadata.type, 'descriptive');
      assert.equal(metadata.contents.render().toString(), '<mods><titleInfo><title>My Thesis</title></titleInfo></mods>');
    });
  });

  describe('using the "aggregate" type with supplemental files and metadata in a section', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      children: [
        { type: 'file', key: 'thesis' },
        {
          type: 'section',
          key: 'supplemental',
          children: [
            { type: 'file', key: 'file' },
            { type: 'text', key: 'abstract' }
          ]
        }
      ],
      bundle: {
        type: 'aggregate',
        main: {
          upload: 'thesis'
        },
        supplemental: [
          {
            context: 'supplemental',
            upload: 'file',
            metadata: ['description']
          }
        ]
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
                items: { type: 'lookup', path: ['abstract'] },
                target: [
                  { type: 'structure', name: 'abstract' }
                ]
              }
            ]
          }
        }
      ]
    });

    let buffer = new Buffer('lorem ipsum');
    let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);
    let dataset = buildTestUpload('dataset.csv', 'text/csv', buffer);
    let appendix = buildTestUpload('appendix.pdf', 'application/pdf', buffer);

    let values = {
      thesis: thesis,
      supplemental: [
        { abstract: 'Dataset', file: dataset },
        { abstract: 'Appendix', file: appendix }
      ]
    };

    let bundle = generateBundle(form, values);

    it('should generate the correct number of items, files, metadata', function() {
      assert.equal(bundle.items.length, 4);
      assert.equal(bundle.files.length, 3);
      assert.equal(bundle.metadata.length, 2);
    });

    it('should generate metadata for the supplemental items', function() {
      let aggregate = bundle.children[0];

      let item, metadata;

      item = aggregate.children.find(i => i.type === 'File' && i.label === 'dataset.csv');
      metadata = item.children.find(i => i instanceof Metadata);
      assert.equal(metadata.contents.render().toString(), '<mods><abstract>Dataset</abstract></mods>');
      assert.equal(metadata.type, 'descriptive');

      item = aggregate.children.find(i => i.type === 'File' && i.label === 'appendix.pdf');
      metadata = item.children.find(i => i instanceof Metadata);
      assert.equal(metadata.contents.render().toString(), '<mods><abstract>Appendix</abstract></mods>');
      assert.equal(metadata.type, 'descriptive');
    });
  });

  describe('using the "aggregate" type with agreements', function() {
    let form = new Form('test', {
      destination: 'uuid:1234',
      title: 'Test',
      children: [
        { type: 'file', key: 'thesis' },
        {
          type: 'agreement',
          key: 'agreement',
          name: 'Deposit Agreement',
          uri: 'http://example.com/agreement',
          prompt: 'I agree to the terms.'
        }
      ],
      bundle: {
        type: 'aggregate',
        main: {
          upload: 'thesis'
        },
        agreements: ['agreement']
      },
      metadata: []
    });

    let buffer = new Buffer('lorem ipsum');
    let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);

    let values = {
      thesis: thesis,
      agreement: {
        name: 'Deposit Agreement',
        uri: 'http://example.com/agreement',
        prompt: 'I agree to the terms.'
      }
    };

    let bundle = generateBundle(form, values);

    it('should generate the correct number of items, files, metadata', function() {
      assert.equal(bundle.items.length, 3);
      assert.equal(bundle.files.length, 2);
      assert.equal(bundle.metadata.length, 0);
    });

    it('should generate a file containing a record of the agreements', function() {
      let aggregate = bundle.children[0];
      let item = aggregate.children.find(i => i.type === 'File' && i.label === 'agreements.txt');
      let file = item.children.find(i => i instanceof File);

      assert.equal(file.contents.toString(), 'Deposit Agreement\nhttp://example.com/agreement\nI agree to the terms.\n');
    });
  });
});
