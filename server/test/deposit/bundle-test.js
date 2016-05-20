'use strict';

const assert = require('assert');
const File = require('../../lib/deposit/bundle/file');
const buildTestUpload = require('../test-helpers').buildTestUpload;

describe('Bundle', function() {
  describe('files', function() {
    it('should set Buffer contents', function() {
      let file = new File(new Buffer('123'), {});

      assert.equal(file.contents.toString(), '123');
    });

    it('should be named "untitled.txt" and have the mimetype "text/plain" unless otherwise specified if its contents are a Buffer', function() {
      let file = new File(new Buffer('123'), {});

      assert.equal(file.name, 'untitled.txt');
      assert.equal(file.mimetype, 'text/plain');
    });

    it('should use its contents\' name and mimetype if its contents are an Upload', function() {
      let upload = buildTestUpload('numbers.txt', 'text/markdown', new Buffer('123'));
      let file = new File(upload, {});

      assert.equal(file.name, 'numbers.txt');
      assert.equal(file.mimetype, 'text/markdown');
    });

    it('should use the optional name and mimetype if specified', function() {
      let file = new File(new Buffer('123'), { name: 'numbers.txt', mimetype: 'text/markdown' });

      assert.equal(file.name, 'numbers.txt');
      assert.equal(file.mimetype, 'text/markdown');
    });

    it('should throw a TypeError if something other than an Upload or Buffer is passed for contents', function() {
      assert.throws(function() {
        /*jshint nonew: false */
        new File('123', {});
      }, TypeError);
    });
  });
});
