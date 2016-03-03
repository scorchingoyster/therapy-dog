import assert from 'assert';
import generateBundle from 'api/generate-bundle';

describe("Bundle generation", function() {
  it("should generate a bundle for a form with just a file", function() {
    var form = {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item kind='File' label=title { file { thesis; } }",
      templates: []
    };

    var values = {
      thesis: {
        id: "abc",
        name: "thesis.pdf",
        type: "application/pdf",
        hash: "def",
        size: 456
      },
      title: "My Thesis"
    };
    
    var bundle = generateBundle(form, values);
    
    assert.equal(bundle.children.length, 1);
    
    var item = bundle.children[0];
    assert.ok(item.id);
    assert.equal(item.kind, "File");
    assert.equal(item.label, "My Thesis");
    assert.equal(item.children.length, 1);
    
    var file = item.children[0];
    assert.ok(file.id);
    assert.deepEqual(file.content[0], values.thesis);
  });

  it("should generate a bundle for a form with a metadata template", function() {
    var form = {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item kind='File' label=title { file { thesis; } metadata { partial 'thesis'; } }",
      templates: [
        {
          id: "thesis",
          type: "xml",
          template: "element 'mods' xmlns='http://www.loc.gov/mods/v3' @compact=true { title -> (element 'titleInfo') (element 'title'); }"
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
    
    assert.equal(bundle.children.length, 1);
    
    var item = bundle.children[0];
    assert.ok(item.id);
    assert.equal(item.kind, "File");
    assert.equal(item.label, "My Thesis");
    assert.equal(item.children.length, 2);
    
    var file = item.children[0];
    assert.ok(file.id);
    assert.equal(file.content[0], values.thesis);
    
    var metadata = item.children[1];
    assert.ok(metadata.id);
    assert.equal(metadata.content.length, 1);
  });
  
  it("should generate a bundle for a form with an aggregate and a link", function() {
    var form = {
      blocks: [
        { type: "file", key: "thesis" },
        { type: "text", key: "title" }
      ],
      bundle: "item kind='Aggregate Work' { link rel='http://example.com/blah' href='#thesis'; item kind='File' fragment='thesis' { file { thesis; } } }",
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
    
    var item = bundle.children[0];
    var link = item.children[0];
    assert.equal(link.rel, 'http://example.com/blah');
    assert.equal(link.href, '#thesis');
  });
});
