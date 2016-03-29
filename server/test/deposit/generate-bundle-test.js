'use strict';

const assert = require('assert');
const Form = require('../../models/form');
const generateBundle = require('../../deposit/generate-bundle');
const buildTestUpload = require('./test-helpers').buildTestUpload;

describe("Bundle generation", function() {
  describe("files", function() {
    describe("with upload bodies", function() {
      let form = new Form('test', {
        bundle: 'item label=thesis.name { thesis -> file }',
        templates: []
      });

      let buffer = new Buffer('lorem ipsum');
      let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);

      let values = {
        thesis: thesis
      };

      let bundle = generateBundle(form, values);
      let item = bundle.children[0];
      let file = bundle.children[0].children[0];

      it("should set item's label using the upload's name", function() {
        assert.equal(item.label, 'thesis.pdf');
      });
    
      it("should set contents for an upload body", function() {
        assert.ok(file.isUpload);
        assert.equal(file.contents, thesis);
      });
  
      it("should set mimetype to the upload's type if not given", function() {
        assert.equal(file.mimetype, 'application/pdf');
      });
  
      it("should set name to the upload's name if not given", function() {
        assert.equal(file.name, 'thesis.pdf');
      });
  
      it("should set size for uploads", function() {
        assert.equal(file.size, buffer.length);
      });
  
      it("should calculate hash digests for uploads", function() {
        return file.getHashDigest('md5', 'hex').then(function(digest) {
          assert.equal(digest, '80a751fde577028640c419000e33eba6');
        });
      });
    });

    describe("with literal bodies", function() {
      let form = new Form('test', {
        bundle: 'item { file { "lorem ipsum" } }',
        templates: []
      });

      let bundle = generateBundle(form, {});
      let file = bundle.children[0].children[0];

      it("should set contents to a buffer for a literal body", function() {
        assert.ok(file.isBuffer);
        assert.equal(file.contents.toString(), 'lorem ipsum');
      });
  
      it("should set mimetype for a literal body to 'text/plain' if not given", function() {
        assert.equal(file.mimetype, 'text/plain');
      });
  
      it("should set name to 'untitled.txt' for a literal body if not given", function() {
        assert.equal(file.name, 'untitled.txt');
      });
  
      it("should set size for literal bodies", function() {
        assert.equal(file.size, 11);
      });
  
      it("should calculate hash digests for literal bodies", function() {
        return file.getHashDigest('md5', 'hex').then(function(digest) {
          assert.equal(digest, '80a751fde577028640c419000e33eba6');
        });
      });
    });
    
    it("should set contents to a zero-length buffer for an empty literal body", function() {
      let form = new Form('test', {
        bundle: 'item { file }',
        templates: []
      });

      let bundle = generateBundle(form, {});
      let file = bundle.children[0].children[0];

      assert.ok(file.isBuffer);
      assert.equal(file.contents.toString(), '');
    });

    describe("with overridden mimetype and name", function() {
      let form = new Form('test', {
        bundle: 'item { file name="stuff.md" mimetype="text/markdown" { "# lorem ipsum" } }',
        templates: []
      });

      let bundle = generateBundle(form, {});
      let file = bundle.children[0].children[0];

      it("should set mimetype if given", function() {
        assert.equal(file.mimetype, 'text/markdown');
      });
  
      it("should set name if given", function() {
        assert.equal(file.name, 'stuff.md');
      });
    });
  
    it("should throw an error if body is invalid", function() {
      let form = new Form('test', {
        bundle: 'item { file { "hello"; file } }',
        templates: []
      });
  
      assert.throws(function() {
        generateBundle(form, {});
      });
    });
  });
  
  describe("metadata", function() {
    let form = new Form('test', {
      bundle: 'item { partial "thesis" -> metadata type="descriptive" }',
      templates: [
        {
          id: 'thesis',
          type: 'xml',
          template: 'element "info" { title -> element "title" }'
        }
      ]
    });

    let values = {
      title: "My Thesis"
    };

    let bundle = generateBundle(form, values);
    let metadata = bundle.children[0].children[0];

    it("should set contents for an Arrow XML partial body", function() {
      assert.ok(metadata.isXML);
      assert.equal(metadata.contents.name, 'info');
    });
    
    it("should set the type property", function() {
      assert.equal(metadata.type, 'descriptive');
    });

    it("should throw an error if body is invalid", function() {
      let form = new Form('test', {
        bundle: 'item { metadata { "hello!" } }',
        templates: []
      });
  
      assert.throws(function() {
        generateBundle(form, {});
      });
    });
  });
  
  describe("items", function() {
    let form = new Form('test', {
      bundle: 'item label="A" type="Folder" { link rel="http://example.com/" href="#b"; item fragment="b" label="B" type="File"; item label="C" type="File" }',
      templates: [
        {
          id: 'thesis',
          type: 'xml',
          template: 'element "info" { title -> element "title" }'
        }
      ]
    });

    let values = {
      title: "My Thesis"
    };

    let bundle = generateBundle(form, values);

    it("should set the label property", function() {
      assert.equal(bundle.children[0].label, 'A');
    });
      
    it("should set the type property", function() {
      assert.equal(bundle.children[0].type, 'Folder');
      assert.equal(bundle.children[0].children[1].type, 'File');
    });
    
    it("should throw an error if body is invalid", function() {
      let form = {
        bundle: 'item { "hello!" }',
        templates: []
      };
  
      assert.throws(function() {
        generateBundle(form, {});
      });
    });
  });
  
  describe("links", function() {
    it("should resolve fragments to item references", function() {
      let form = new Form('test', {
        bundle: 'item { link rel="x" href="#a"; item fragment="a" }',
        templates: []
      });

      let bundle = generateBundle(form, {});

      assert.equal(bundle.links.length, 1);
      assert.equal(bundle.links[0].items.length, 1);
      assert.equal(bundle.links[0].items[0], bundle.children[0].children[1]);
      assert.equal(bundle.children[0].children[0].items[0], bundle.children[0].children[1]);
    });
    
    it("should resolve fragments to nothing if an item can't be found", function() {
      let form = new Form('test', {
        bundle: 'item { link rel="y" href="#b"; item fragment="a" }',
        templates: []
      });

      let bundle = generateBundle(form, {});

      assert.equal(bundle.links.length, 1);
      assert.equal(bundle.links[0].items.length, 0);
    });
    
    it("should resolve fragments to multiple items", function() {
      let form = new Form('test', {
        bundle: 'item { link rel="x" href="#stuff"; item fragment="stuff" label="a" } item fragment="stuff" label="b"',
        templates: []
      });

      let bundle = generateBundle(form, {});
      assert.equal(bundle.links.length, 1);
      assert.equal(bundle.links[0].items[0], bundle.children[0].children[1]);
      assert.equal(bundle.links[0].items[1], bundle.children[1]);
    });
    
    it("should leave other href values intact", function() {
      let form = new Form('test', {
        bundle: 'item { link rel="x" href="http://whatever" }',
        templates: []
      });

      let bundle = generateBundle(form, {});

      assert.equal(bundle.links.length, 1);
      assert.equal(bundle.links[0].items, null);
      assert.equal(bundle.links[0].href, 'http://whatever');
    });
  });
  
  describe("documents", function() {
    it("should make all files, items, metadata, and links available as a flattened array", function() {
      let form = new Form('test', {
        bundle: 'item { link rel="x" href="#a"; item { file { "xyz" }; partial "stuff" -> metadata } }',
        templates: [
          {
            id: 'stuff',
            type: 'xml',
            template: 'element "blah";'
          }
        ]
      });

      let bundle = generateBundle(form, {});

      assert.equal(bundle.files.length, 1);
      assert.equal(bundle.items.length, 2);
      assert.equal(bundle.metadata.length, 1);
      assert.equal(bundle.links.length, 1);
    });
    
    it("should throw an error if any of document children are not items", function() {
      let form = new Form('test', {
        bundle: 'link rel="x" href="http://whatever"',
        templates: []
      });
  
      assert.throws(function() {
        generateBundle(form, {});
      });
    });
  });
});
