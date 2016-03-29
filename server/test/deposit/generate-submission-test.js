'use strict';

const assert = require('assert');
const libxmljs = require('libxmljs');
const Form = require('../../models/form');
const generateSubmission = require('../../deposit/generate-submission');
const generateBundle = require('../../deposit/generate-bundle');
const buildTestUpload = require('./test-helpers').buildTestUpload;

describe("Submission generation", function() {
  describe("with metadata and files", function() {
    let form = new Form('test', {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item type='File' label=title { file { thesis; }; metadata type='descriptive' { partial 'thesis'; }; metadata type='access-control' { partial 'unpublished'; } }",
      templates: [
        {
          id: "thesis",
          type: "xml",
          template: "element 'mods' xmlns='http://www.loc.gov/mods/v3' @compact=true { title -> (element 'titleInfo') (element 'title'); }"
        },
        {
          id: "unpublished",
          type: "xml",
          template: "element 'accessControl' xmlns='http://cdr.unc.edu/definitions/acl' published='false' {}"
        }
      ]
    });

    let buffer = new Buffer('lorem ipsum');
    let thesis = buildTestUpload('thesis.pdf', 'application/pdf', buffer);

    let values = {
      thesis: thesis,
      title: "My Thesis"
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return libxmljs.parseXml(submission["mets.xml"]);
    });
    
    it("should contain METS XML as a Buffer, and the upload's path", function() {
      return submission.then(function(submission) {
        assert.ok(submission["mets.xml"] instanceof Buffer);
        assert.equal(submission[bundle.files[0].id], bundle.files[0].contents.path);
      });
    });
  
    it("should generate a mets element with the correct profile", function() {
      return doc.then(function(doc) {
        let mets = doc.get("/mets:mets", { mets: "http://www.loc.gov/METS/" });
        assert.equal(mets.attr("PROFILE").value(), "http://cdr.unc.edu/METS/profiles/Simple");
      });
    });
  
    it("should generate a metsHdr element", function() {
      return doc.then(function(doc) {
        let metsHdr = doc.get("/mets:mets/mets:metsHdr", { mets: "http://www.loc.gov/METS/" });
        assert.ok(metsHdr);
        assert.ok(metsHdr.attr("CREATEDATE"));

        let agent = metsHdr.get("mets:agent", { mets: "http://www.loc.gov/METS/" });
        assert.ok(agent);
        assert.ok(agent.attr("ROLE"));
        assert.ok(agent.attr("TYPE"));

        let name = agent.get("mets:name", { mets: "http://www.loc.gov/METS/" });
        assert.ok(name);
      });
    });
  
    it("should generate a dmdSec element", function() {
      return doc.then(function(doc) {
        let dmdSec = doc.get("/mets:mets/mets:dmdSec", { mets: "http://www.loc.gov/METS/" });
        assert.ok(dmdSec);
        assert.equal(dmdSec.attr("ID").value(), bundle.children[0].children[1].id);

        let mdWrap = dmdSec.get("mets:mdWrap", { mets: "http://www.loc.gov/METS/" });
        assert.ok(mdWrap);
        assert.equal(mdWrap.attr("MDTYPE").value(), "MODS");

        let mods = mdWrap.get("mets:xmlData/mods:mods", { mets: "http://www.loc.gov/METS/", mods: "http://www.loc.gov/mods/v3" });
        assert.ok(mods);

        let title = mods.get("mods:titleInfo/mods:title", { mods: "http://www.loc.gov/mods/v3" });
        assert.ok(title);
        assert.equal(title.text(), "My Thesis");
      });
    });
  
    it("should generate an amdSec element", function() {
      return doc.then(function(doc) {
        let amdSec = doc.get("/mets:mets/mets:amdSec", { mets: "http://www.loc.gov/METS/" });
        assert.ok(amdSec);

        let rightsMD = amdSec.get("mets:rightsMD", { mets: "http://www.loc.gov/METS/" });
        assert.equal(rightsMD.attr("ID").value(), bundle.children[0].children[2].id);

        let mdWrap = rightsMD.get("mets:mdWrap", { mets: "http://www.loc.gov/METS/" });
        assert.ok(mdWrap);
        assert.equal(mdWrap.attr("MDTYPE").value(), "OTHER");

        let accessControl = mdWrap.get("mets:xmlData/acl:accessControl", { mets: "http://www.loc.gov/METS/", acl: "http://cdr.unc.edu/definitions/acl" });
        assert.ok(accessControl);
        assert.equal(accessControl.attr("published").value(), "false");
      });
    });
  
    it("should generate a file element", function() {
      return doc.then(function(doc) {
        let file = doc.get("/mets:mets/mets:fileSec/mets:fileGrp/mets:file", { mets: "http://www.loc.gov/METS/" });
        assert.ok(file);
        assert.equal(file.attr("ID").value(), bundle.children[0].children[0].id);
        assert.equal(file.attr("MIMETYPE").value(), "application/pdf");
        assert.equal(file.attr("CHECKSUM").value(), "80a751fde577028640c419000e33eba6");
        assert.equal(file.attr("CHECKSUMTYPE").value(), "MD5");
        assert.equal(file.attr("SIZE").value(), "11");

        let flocat = file.get("mets:FLocat", { mets: "http://www.loc.gov/METS/" });
        assert.ok(flocat);
        assert.equal(flocat.get("@xlink:href", { xlink: "http://www.w3.org/1999/xlink" }).value(), bundle.files[0].id);
      });
    });
  
    it("should generate a div element linked to the file element and metadata elements", function() {
      return doc.then(function(doc) {
        let div = doc.get("/mets:mets/mets:structMap/mets:div", { mets: "http://www.loc.gov/METS/" });
        assert.ok(div);
        assert.equal(div.attr("ID").value(), bundle.children[0].id);
        assert.equal(div.attr("TYPE").value(), "File");
        assert.equal(div.attr("LABEL").value(), "My Thesis");
        assert.equal(div.attr("DMDID").value(), bundle.children[0].children[1].id);
        assert.equal(div.attr("ADMID").value(), bundle.children[0].children[2].id);

        let fptr = div.get("mets:fptr", { mets: "http://www.loc.gov/METS/" });
        assert.ok(fptr);
        assert.equal(fptr.attr("FILEID").value(), bundle.children[0].children[0].id);
      });
    });
  
    it("should generate sections in order", function() {
      return doc.then(function(doc) {
        let sections = doc.find("/mets:mets/*", { mets: "http://www.loc.gov/METS/" });
        let names = sections.map(function(s) { return s.name(); });

        assert.deepEqual(["metsHdr", "dmdSec", "amdSec", "fileSec", "structMap"], names);
      });
    });
  });
  
  describe("with multiple access control metadata elements", function() {
    let form = new Form('test', {
      children: [],
      bundle: "item type='Folder' label='My Folder' { item type='Folder' label='A' { metadata type='access-control' { partial 'unpublished'; } }; item type='Folder' label='B' { metadata type='access-control' { partial 'unpublished'; } } }",
      templates: [
        {
          id: "unpublished",
          type: "xml",
          template: "element 'accessControl' xmlns='http://cdr.unc.edu/definitions/acl' published='false' {}"
        }
      ]
    });

    let values = {};

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return libxmljs.parseXml(submission["mets.xml"]);
    });

    it("should generate an amdSec element", function() {
      return doc.then(function(doc) {
        let amdSec = doc.find("/mets:mets/mets:amdSec", { mets: "http://www.loc.gov/METS/" });
        assert.equal(amdSec.length, 1);

        let rightsMD = amdSec[0].find("mets:rightsMD", { mets: "http://www.loc.gov/METS/" });
        assert.equal(rightsMD.length, 2);
        assert.equal(rightsMD[0].attr("ID").value(), bundle.children[0].children[0].children[0].id);
        assert.equal(rightsMD[1].attr("ID").value(), bundle.children[0].children[1].children[0].id);
      });
    });

    it("should generate div elements linked to the metadata elements", function() {
      return doc.then(function(doc) {
        let inner = doc.find("/mets:mets/mets:structMap/mets:div/mets:div", { mets: "http://www.loc.gov/METS/" });
        assert.equal(inner.length, 2);
        
        assert.equal(inner[0].attr("TYPE").value(), "Folder");
        assert.equal(inner[0].attr("LABEL").value(), "A");
        assert.equal(inner[0].attr("ADMID").value(), bundle.children[0].children[0].children[0].id);
        
        assert.equal(inner[1].attr("TYPE").value(), "Folder");
        assert.equal(inner[1].attr("LABEL").value(), "B");
        assert.equal(inner[1].attr("ADMID").value(), bundle.children[0].children[1].children[0].id);
      });
    });
  });

  describe("with links", function() {
    let form = new Form('test', {
      blocks: [
        { type: "text", key: "title" }
      ],
      bundle: "item kind='Aggregate Work' label=title { link rel='http://example.com/blah' href='#thesis'; item kind='File' fragment='thesis' }",
      templates: []
    });

    let values = {
      title: "My Thesis"
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return libxmljs.parseXml(submission["mets.xml"]);
    });

    it("should generate a structLink element with a link from the Aggregate Work div to the File div", function() {
      return doc.then(function(doc) {
        let smLink = doc.get("/mets:mets/mets:structLink/mets:smLink", { mets: "http://www.loc.gov/METS/" });
        assert.ok(smLink);
        assert.equal(smLink.get("@xlink:arcrole", { xlink: "http://www.w3.org/1999/xlink" }).value(), "http://example.com/blah");
        assert.equal(smLink.get("@xlink:from", { xlink: "http://www.w3.org/1999/xlink" }).value(), "#" + bundle.children[0].id);
        assert.equal(smLink.get("@xlink:to", { xlink: "http://www.w3.org/1999/xlink" }).value(), "#" + bundle.children[0].children[1].id);
      });
    });
  });

  describe("with literal file contents", function() {
    let form = new Form('test', {
      bundle: "item kind='File' { file { agreement.terms; '\\n'; agreement.date; '\\n'; agreement.agent; '\\n'; } }",
      templates: []
    });

    let values = {
      agreement: {
        terms: "You agree to the terms, etc.",
        date: "2016-01-01",
        agent: "someone"
      }
    };

    let bundle = generateBundle(form, values);
    let submission = generateSubmission(form, bundle);
    let doc = submission.then(function(submission) {
      return libxmljs.parseXml(submission["mets.xml"]);
    });
    
    it("should contain the literal contents as a buffer", function() {
      return submission.then(function(submission) {
        assert.equal(submission[bundle.files[0].id].toString(), "You agree to the terms, etc.\n2016-01-01\nsomeone\n");
      });
    });

    it("should generate a file element", function() {
      return doc.then(function(doc) {
        let file = doc.get("/mets:mets/mets:fileSec/mets:fileGrp/mets:file", { mets: "http://www.loc.gov/METS/" });
        assert.ok(file);
        assert.equal(file.attr("ID").value(), bundle.children[0].children[0].id);
        assert.equal(file.attr("MIMETYPE").value(), "text/plain");
        assert.equal(file.attr("CHECKSUM").value(), "3257dcd83a3042bdae7b3700c196769a");
        assert.equal(file.attr("CHECKSUMTYPE").value(), "MD5");
        assert.equal(file.attr("SIZE").value(), "48");

        let flocat = file.get("mets:FLocat", { mets: "http://www.loc.gov/METS/" });
        assert.ok(flocat);
        assert.equal(flocat.get("@xlink:href", { xlink: "http://www.w3.org/1999/xlink" }).value(), bundle.files[0].id);
      });
    });
  });

});
