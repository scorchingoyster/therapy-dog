var assert = require("assert");
var libxmljs = require("libxmljs");
var generateMets = require("../lib/generate-mets");
var generateBundle = require("../lib/generate-bundle");

describe("METS generation", function() {
  
  describe("with metadata and files", function() {
    var form = {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item kind='File' label=title { file { thesis }; metadata { partial 'thesis' } }",
      templates: [
        {
          id: "thesis",
          type: "xml",
          template: "element 'mods' xmlns='http://www.loc.gov/mods/v3' @compact=true { title -> (element 'titleInfo') (element 'title') }"
        }
      ]
    };
    
    var values = {
      thesis: {
        type: "upload",
        id: "abc",
        name: "thesis.pdf",
        type: "application/pdf",
        hash: "def",
        size: 456
      },
      title: "My Thesis"
    };
    
    var bundle = generateBundle(form, values);
    
    var xml = generateMets(form, bundle);
    
    console.log(xml);
  
    var doc = libxmljs.parseXml(xml);
  
    it("should generate a mets element with the correct profile", function() {
      var mets = doc.get("/mets:mets", { mets: "http://www.loc.gov/METS/" });
      assert.equal(mets.attr("PROFILE").value(), "http://cdr.unc.edu/METS/profiles/Simple");
    });
  
    it("should generate a metsHdr element", function() {
      var metsHdr = doc.get("/mets:mets/mets:metsHdr", { mets: "http://www.loc.gov/METS/" });
      assert.ok(metsHdr);
      assert.ok(metsHdr.attr("CREATEDATE"));
    
      var agent = metsHdr.get("mets:agent", { mets: "http://www.loc.gov/METS/" });
      assert.ok(agent);
      assert.ok(agent.attr("ROLE"));
      assert.ok(agent.attr("TYPE"));
    
      var name = agent.get("mets:name", { mets: "http://www.loc.gov/METS/" });
      assert.ok(name);
    });
  
    it("should generate a dmdSec element", function() {
      var dmdSec = doc.get("/mets:mets/mets:dmdSec", { mets: "http://www.loc.gov/METS/" });
      assert.ok(dmdSec);
      assert.equal(dmdSec.attr("ID").value(), bundle.children[0].children[1].id);
    
      var mdWrap = dmdSec.get("mets:mdWrap", { mets: "http://www.loc.gov/METS/" });
      assert.ok(mdWrap);
      assert.equal(mdWrap.attr("MDTYPE").value(), "MODS");
    
      var mods = mdWrap.get("mets:xmlData/mods:mods", { mets: "http://www.loc.gov/METS/", mods: "http://www.loc.gov/mods/v3" });
      assert.ok(mods);
    
      var title = mods.get("mods:titleInfo/mods:title", { mods: "http://www.loc.gov/mods/v3" });
      assert.ok(title);
      assert.equal(title.text(), "My Thesis");
    });
  
    it("should generate a file element", function() {
      var file = doc.get("/mets:mets/mets:fileSec/mets:fileGrp/mets:file", { mets: "http://www.loc.gov/METS/" });
      assert.ok(file);
      assert.equal(file.attr("ID").value(), bundle.children[0].children[0].id);
      assert.equal(file.attr("MIMETYPE").value(), "application/pdf");
      assert.equal(file.attr("CHECKSUM").value(), "def");
      assert.equal(file.attr("CHECKSUMTYPE").value(), "MD5");
      assert.equal(file.attr("SIZE").value(), "456");
    
      var flocat = file.get("mets:FLocat", { mets: "http://www.loc.gov/METS/" });
      assert.ok(flocat);
      assert.equal(flocat.get("@xlink:href", { xlink: "http://www.w3.org/1999/xlink" }).value(), "abc");
    });
  
    it("should generate a div element linked to the file element and the dmdSec element", function() {
      var div = doc.get("/mets:mets/mets:structMap/mets:div", { mets: "http://www.loc.gov/METS/" });
      assert.ok(div);
      assert.equal(div.attr("ID").value(), bundle.children[0].id);
      assert.equal(div.attr("TYPE").value(), "File");
      assert.equal(div.attr("LABEL").value(), "My Thesis");
      assert.equal(div.attr("DMDID").value(), bundle.children[0].children[1].id);
    
      var fptr = div.get("mets:fptr", { mets: "http://www.loc.gov/METS/" });
      assert.ok(fptr);
      assert.equal(fptr.attr("FILEID").value(), bundle.children[0].children[0].id);
    });
  
  });

  describe("with links", function() {
    var form = {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item kind='Aggregate Work' label=title { link rel='http://example.com/blah' href='#thesis'; item kind='File' fragment='thesis' { file { thesis } } }",
      templates: []
    };
    
    var values = {
      thesis: {
        type: "upload",
        id: "abc",
        name: "thesis.pdf",
        type: "application/pdf",
        hash: "def",
        size: 456
      },
      title: "My Thesis"
    };
  
    var bundle = generateBundle(form, values);
    var xml = generateMets(form, bundle);
  
    var doc = libxmljs.parseXml(xml);
  
    it("should generate a structLink element with a link from the Aggregate Work div to the File div", function() {
      var smLink = doc.get("/mets:mets/mets:structLink/mets:smLink", { mets: "http://www.loc.gov/METS/" });
      assert.ok(smLink);
      assert.equal(smLink.get("@xlink:arcrole", { xlink: "http://www.w3.org/1999/xlink" }).value(), "http://example.com/blah");
      assert.equal(smLink.get("@xlink:from", { xlink: "http://www.w3.org/1999/xlink" }).value(), "#" + bundle.children[0].id);
      assert.equal(smLink.get("@xlink:to", { xlink: "http://www.w3.org/1999/xlink" }).value(), "#" + bundle.children[0].children[1].id);
    });
  
  });

});
