'use strict';

const assert = require('assert');
const xpath = require('xpath');
const DOMParser = require('xmldom').DOMParser;
const Form = require('../../lib/models/form');
const generateSubmission = require('../../lib/deposit/generate-submission');
const generateBundle = require('../../lib/deposit/generate-bundle');
const buildTestUpload = require('./test-helpers').buildTestUpload;

const select = xpath.useNamespaces({
  mets: 'http://www.loc.gov/METS/',
  mods: 'http://www.loc.gov/mods/v3',
  xlink: 'http://www.w3.org/1999/xlink',
  acl: 'http://cdr.unc.edu/definitions/acl'
});
const select1 = function(e, doc) { return select(e, doc, true); };

describe('Submission generation', function() {
  describe('with metadata and files', function() {
    let form = new Form('test', {
      blocks: [
        { type: 'file', key: 'thesis' },
        { type: 'text', key: 'title' }
      ],
      bundle: 'item type="File" label=title { file { thesis; }; metadata type="descriptive" { partial "thesis"; }; metadata type="access-control" { partial "unpublished"; } }',
      templates: [
        {
          id: 'thesis',
          type: 'xml',
          template: 'element "mods" xmlns="http://www.loc.gov/mods/v3" @compact=true { title -> (element "titleInfo") (element "title"); }'
        },
        {
          id: 'unpublished',
          type: 'xml',
          template: 'element "accessControl" xmlns="http://cdr.unc.edu/definitions/acl" published="false" {}'
        }
      ]
    });

    let buffer = new Buffer('lorem ipsum');
    let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);

    let values = {
      thesis: thesis,
      title: 'My Thesis'
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return new DOMParser().parseFromString(submission['mets.xml'].toString());
    });

    it('should contain METS XML as a Buffer, and the upload\'s path', function() {
      return submission.then(function(submission) {
        assert.ok(submission['mets.xml'] instanceof Buffer);
        assert.equal(submission[bundle.files[0].id], bundle.files[0].contents.path);
      });
    });

    it('should generate a mets element with the correct profile', function() {
      return doc.then(function(doc) {
        let mets = select1('/mets:mets', doc);
        assert.equal(mets.getAttribute('PROFILE'), 'http://cdr.unc.edu/METS/profiles/Simple');
      });
    });

    it('should generate a metsHdr element', function() {
      return doc.then(function(doc) {
        let metsHdr = select1('/mets:mets/mets:metsHdr', doc);
        assert.ok(metsHdr);
        assert.ok(metsHdr.getAttribute('CREATEDATE'));

        let agent = select1('mets:agent', metsHdr);
        assert.ok(agent);
        assert.ok(agent.getAttribute('ROLE'));
        assert.ok(agent.getAttribute('TYPE'));

        let name = select1('mets:name', agent);
        assert.ok(name);
      });
    });

    it('should generate a dmdSec element', function() {
      return doc.then(function(doc) {
        let dmdSec = select1('/mets:mets/mets:dmdSec', doc);
        assert.ok(dmdSec);
        assert.equal(dmdSec.getAttribute('ID'), bundle.children[0].children[1].id);

        let mdWrap = select1('mets:mdWrap', dmdSec);
        assert.ok(mdWrap);
        assert.equal(mdWrap.getAttribute('MDTYPE'), 'MODS');

        let mods = select1('mets:xmlData/mods:mods', mdWrap);
        assert.ok(mods);

        let title = select1('mods:titleInfo/mods:title/text()', mods);
        assert.ok(title);
        assert.equal(title, 'My Thesis');
      });
    });

    it('should generate an amdSec element', function() {
      return doc.then(function(doc) {
        let amdSec = select1('/mets:mets/mets:amdSec', doc);
        assert.ok(amdSec);

        let rightsMD = select1('mets:rightsMD', amdSec);
        assert.equal(rightsMD.getAttribute('ID'), bundle.children[0].children[2].id);

        let mdWrap = select1('mets:mdWrap', rightsMD);
        assert.ok(mdWrap);
        assert.equal(mdWrap.getAttribute('MDTYPE'), 'OTHER');

        let accessControl = select1('mets:xmlData/acl:accessControl', mdWrap);
        assert.ok(accessControl);
        assert.equal(accessControl.getAttribute('published'), 'false');
      });
    });

    it('should generate a file element', function() {
      return doc.then(function(doc) {
        let file = select1('/mets:mets/mets:fileSec/mets:fileGrp/mets:file', doc);
        assert.ok(file);
        assert.equal(file.getAttribute('ID'), bundle.children[0].children[0].id);
        assert.equal(file.getAttribute('MIMETYPE'), 'application/pdf');
        assert.equal(file.getAttribute('CHECKSUM'), '80a751fde577028640c419000e33eba6');
        assert.equal(file.getAttribute('CHECKSUMTYPE'), 'MD5');
        assert.equal(file.getAttribute('SIZE'), '11');

        let flocat = select1('mets:FLocat', file);
        assert.ok(flocat);
        assert.equal(select1('@xlink:href', flocat).value, bundle.files[0].id);
      });
    });

    it('should generate a div element linked to the file element and metadata elements', function() {
      return doc.then(function(doc) {
        let div = select1('/mets:mets/mets:structMap/mets:div', doc);
        assert.ok(div);
        assert.equal(div.getAttribute('ID'), bundle.children[0].id);
        assert.equal(div.getAttribute('TYPE'), 'File');
        assert.equal(div.getAttribute('LABEL'), 'My Thesis');
        assert.equal(div.getAttribute('DMDID'), bundle.children[0].children[1].id);
        assert.equal(div.getAttribute('ADMID'), bundle.children[0].children[2].id);

        let fptr = select1('mets:fptr', div);
        assert.ok(fptr);
        assert.equal(fptr.getAttribute('FILEID'), bundle.children[0].children[0].id);
      });
    });

    it('should generate sections in order', function() {
      return doc.then(function(doc) {
        let sections = select('/mets:mets/*', doc);
        let names = sections.map(function(s) { return s.tagName; });

        assert.deepEqual(['metsHdr', 'dmdSec', 'amdSec', 'fileSec', 'structMap'], names);
      });
    });
  });

  describe('with multiple access control metadata elements', function() {
    let form = new Form('test', {
      children: [],
      bundle: 'item type="Folder" label="My Folder" { item type="Folder" label="A" { metadata type="access-control" { partial "unpublished"; } }; item type="Folder" label="B" { metadata type="access-control" { partial "unpublished"; } } }',
      templates: [
        {
          id: 'unpublished',
          type: 'xml',
          template: 'element "accessControl" xmlns="http://cdr.unc.edu/definitions/acl" published="false" {}'
        }
      ]
    });

    let values = {};

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return new DOMParser().parseFromString(submission['mets.xml'].toString());
    });

    it('should generate an amdSec element', function() {
      return doc.then(function(doc) {
        let amdSec = select('/mets:mets/mets:amdSec', doc);
        assert.equal(amdSec.length, 1);

        let rightsMD = select('mets:rightsMD', amdSec[0]);
        assert.equal(rightsMD.length, 2);
        assert.equal(rightsMD[0].getAttribute('ID'), bundle.children[0].children[0].children[0].id);
        assert.equal(rightsMD[1].getAttribute('ID'), bundle.children[0].children[1].children[0].id);
      });
    });

    it('should generate div elements linked to the metadata elements', function() {
      return doc.then(function(doc) {
        let inner = select('/mets:mets/mets:structMap/mets:div/mets:div', doc);
        assert.equal(inner.length, 2);

        assert.equal(inner[0].getAttribute('TYPE'), 'Folder');
        assert.equal(inner[0].getAttribute('LABEL'), 'A');
        assert.equal(inner[0].getAttribute('ADMID'), bundle.children[0].children[0].children[0].id);

        assert.equal(inner[1].getAttribute('TYPE'), 'Folder');
        assert.equal(inner[1].getAttribute('LABEL'), 'B');
        assert.equal(inner[1].getAttribute('ADMID'), bundle.children[0].children[1].children[0].id);
      });
    });
  });

  describe('with links', function() {
    let form = new Form('test', {
      blocks: [
        { type: 'text', key: 'title' }
      ],
      bundle: 'item kind="Aggregate Work" label=title { link rel="http://example.com/blah" href="#thesis"; item kind="File" fragment="thesis" }',
      templates: []
    });

    let values = {
      title: 'My Thesis'
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return new DOMParser().parseFromString(submission['mets.xml'].toString());
    });

    it('should generate a structLink element with a link from the Aggregate Work div to the File div', function() {
      return doc.then(function(doc) {
        let smLink = select1('/mets:mets/mets:structLink/mets:smLink', doc);
        assert.ok(smLink);
        assert.equal(select1('@xlink:arcrole', smLink).value, 'http://example.com/blah');
        assert.equal(select1('@xlink:from', smLink).value, '#' + bundle.children[0].id);
        assert.equal(select1('@xlink:to', smLink).value, '#' + bundle.children[0].children[1].id);
      });
    });
  });

  describe('with literal file contents', function() {
    let form = new Form('test', {
      bundle: 'item kind="File" { file { agreement.terms; "\\n"; agreement.date; "\\n"; agreement.agent; "\\n"; } }',
      templates: []
    });

    let values = {
      agreement: {
        terms: 'You agree to the terms, etc.',
        date: '2016-01-01',
        agent: 'someone'
      }
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return new DOMParser().parseFromString(submission['mets.xml'].toString());
    });

    it('should contain the literal contents as a buffer', function() {
      return submission.then(function(submission) {
        assert.equal(submission[bundle.files[0].id].toString(), 'You agree to the terms, etc.\n2016-01-01\nsomeone\n');
      });
    });

    it('should generate a file element', function() {
      return doc.then(function(doc) {
        let file = select1('/mets:mets/mets:fileSec/mets:fileGrp/mets:file', doc);
        assert.ok(file);
        assert.equal(file.getAttribute('ID'), bundle.children[0].children[0].id);
        assert.equal(file.getAttribute('MIMETYPE'), 'text/plain');
        assert.equal(file.getAttribute('CHECKSUM'), '3257dcd83a3042bdae7b3700c196769a');
        assert.equal(file.getAttribute('CHECKSUMTYPE'), 'MD5');
        assert.equal(file.getAttribute('SIZE'), '48');

        let flocat = select1('mets:FLocat', file);
        assert.ok(flocat);
        assert.equal(select1('@xlink:href', flocat).value, bundle.files[0].id);
      });
    });
  });
});
