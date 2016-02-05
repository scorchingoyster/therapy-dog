var assert = require('assert');
var b = require('../../lib/arrow/builders');

describe("Arrow builders", function() {

  it("should build an ast for a hash with a string and boolean", function() {
    // xmlns="http://www.loc.gov/mods/v3" @compact=true
    var actual = b.hash([b.pair("xmlns", b.string("http://www.loc.gov/mods/v3")), b.pair("@compact", b.boolean(true))]);
  
    var expected = {
      type: "hash",
      pairs: [
        {
          type: "pair",
          key: "xmlns",
          value: {
            type: "string",
            value: "http://www.loc.gov/mods/v3"
          }
        },
        {
          type: "pair",
          key: "@compact",
          value: {
            type: "boolean",
            value: true
          }
        }
      ]
    };
  
    assert.deepEqual(actual, expected);
  })

  it("should build an ast for a call with a block", function() {
    // each authors as |author index| { author }
    var actual = b.call("each", [b.call("authors")], b.hash(), ["author", "index"], b.program([b.call("author")]));
  
    var expected = {
      type: "call",
      name: "each",
      params: [
        {
          type: "call",
          name: "authors",
          params: [],
          hash: { type: "hash", pairs: [] },
          locals: [],
          body: null,
          inverse: null
        }
      ],
      hash: { type: "hash", pairs: [] },
      locals: ["author", "index"],
      body: {
        type: "program",
        body: [
          {
            type: "call",
            name: "author",
            params: [],
            hash: { type: "hash", pairs: [] },
            locals: [],
            body: null,
            inverse: null
          }
        ]
      },
      inverse: null
    };
  
    assert.deepEqual(actual, expected);
  });

  it("should build an ast for an arrow with a path source and a call target with a hash", function() {
    // author.first -> element "namePart" type="given"
    var actual = b.arrow(b.path(["author", "first"]), [
      b.call("element", [b.string("namePart")], b.hash([b.pair("type", b.string("given"))]))
    ]);

    var expected = {
      type: "arrow",
      source: {
        type: "path",
        parts: ["author", "first"]
      },
      target: [
        {
          type: "call",
          name: "element",
          params: [
            { type: "string", value: "namePart" }
          ],
          hash: {
            type: "hash",
            pairs: [
              {
                type: "pair",
                key: "type",
                value: {
                  type: "string",
                  value: "given"
                }
              }
            ]
          },
          locals: [],
          body: null,
          inverse: null
        }
      ]
    };

    assert.deepEqual(actual, expected);
  });

});
