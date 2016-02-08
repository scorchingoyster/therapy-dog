var assert = require('assert');
var Arrow = require('../../lib/arrow');
var XML = require('../../lib/arrow/xml');
var b = require('../../lib/arrow/builders');

describe("XML doc", function() {

  it("can evaluate a basic element", function() {
    // element "stuff" ok="yes" {
    //   element "hi" { "hello" }
    // }
    var template = b.program([
      b.call("element", [b.string("stuff")], b.hash([b.pair("ok", b.string("yes"))]), [], b.program([
        b.call("element", [b.string("hi")], b.hash(), [], b.program([b.string("hello")]))
      ]))
    ]);
  
    var data = {};
  
    var expected = [
      {
        type: "element",
        name: "stuff",
        attributes: {
          ok: "yes"
        },
        keep: false,
        children: [
          {
            type: "element",
            name: "hi",
            attributes: {},
            keep: false,
            children: ["hello"]
          }
        ]
      }
    ];
  
    assert.deepEqual(new Arrow(XML, template).evaluate(data).nodes, expected);
  });

  it("can render a basic element", function() {
    // element "stuff" ok="yes" {
    //   element "hi" { "hello" }
    // }
    var template = b.program([
      b.call("element", [b.string("stuff")], b.hash([b.pair("ok", b.string("yes"))]), [], b.program([
        b.call("element", [b.string("hi")], b.hash(), [], b.program([b.string("hello")]))
      ]))
    ]);

    var data = {};

    var expected = '<?xml version="1.0"?><stuff ok=\"yes\"><hi>hello</hi></stuff>';

    assert.deepEqual(new Arrow(XML, template).evaluate(data).render(), expected);
  });

  it("hash keys starting with '@' are interpreted as options rather than attributes", function() {
    // element "stuff" @whatever=123
    var template = b.program([
      b.call("element", [b.string("stuff")], b.hash([b.pair("@whatever", b.number(123))]))
    ]);

    var data = {};

    var expected = [
      {
        type: "element",
        name: "stuff",
        attributes: {},
        keep: false,
        children: []
      }
    ];

    assert.deepEqual(new Arrow(XML, template).evaluate(data).nodes, expected);
  });

  it("for a compact element, should only remove children not marked for keeping or with data children", function() {
    // element "outer" @compact=true {
    //   element "inner" { first }
    //   element "inner" { last }
    //   element "inner" { "stuff" }
    //   element "inner" @keep=true { "boilerplate" }
    // }
    var template = b.program([
      b.call("element", [b.string("outer")], b.hash([b.pair("@compact", b.boolean(true))]), [], b.program([
        b.call("element", [b.string("inner")], b.hash(), [], b.program([b.call("first")])),
        b.call("element", [b.string("inner")], b.hash(), [], b.program([b.call("last")])),
        b.call("element", [b.string("inner")], b.hash(), [], b.program([b.string("stuff")])),
        b.call("element", [b.string("inner")], b.hash([b.pair("@keep", b.boolean(true))]), [], b.program([b.string("boilerplate")]))
      ]))
    ]);

    var data = { first: "Someone" };

    var expected = [
      {
        type: "element",
        name: "outer",
        attributes: {},
        keep: true,
        children: [
          {
            type: "element",
            name: "inner",
            attributes: {},
            keep: true,
            children: [
              "Someone"
            ]
          },
          {
            type: "element",
            name: "inner",
            attributes: {},
            keep: true,
            children: ["boilerplate"]
          }
        ]
      }
    ];

    assert.deepEqual(new Arrow(XML, template).evaluate(data).nodes, expected);
  });

  it("an element is kept if at least one of its children is data", function() {
    // element "outer" @compact=true {
    //   element "inner" {
    //     first
    //     last
    //   }
    // }
    var template = b.program([
      b.call("element", [b.string("outer")], b.hash([b.pair("@compact", b.boolean(true))]), [], b.program([
        b.call("element", [b.string("inner")], b.hash(), [], b.program([
          b.call("first"),
          b.call("last")
        ]))
      ]))
    ]);

    var data = { first: "Someone" };

    var expected = [
      {
        type: "element",
        name: "outer",
        attributes: {},
        keep: true,
        children: [
          {
            type: "element",
            name: "inner",
            attributes: {},
            keep: true,
            children: [
              "Someone"
            ]
          }
        ]
      }
    ];

    assert.deepEqual(new Arrow(XML, template).evaluate(data).nodes, expected);
  });

  it("an element is kept if at least one of its descendants is marked for keeping", function() {
    // element "outer" @compact=true {
    //   element "inner" {
    //     element "blah"
    //     element "blah" @keep=true
    //   }
    // }
    var template = b.program([
      b.call("element", [b.string("outer")], b.hash([b.pair("@compact", b.boolean(true))]), [], b.program([
        b.call("element", [b.string("inner")], b.hash(), [], b.program([
          b.call("element", [b.string("blah")], b.hash()),
          b.call("element", [b.string("blah")], b.hash([b.pair("@keep", b.boolean(true))]))
        ]))
      ]))
    ]);

    var data = { first: "Someone" };

    var expected = [
      {
        type: "element",
        name: "outer",
        attributes: {},
        keep: true,
        children: [
          {
            type: "element",
            name: "inner",
            attributes: {},
            keep: true,
            children: [
              {
                type: "element",
                name: "blah",
                attributes: {},
                keep: false,
                children: []
              },
              {
                type: "element",
                name: "blah",
                attributes: {},
                keep: true,
                children: []
              }
            ]
          }
        ]
      }
    ];

    assert.deepEqual(new Arrow(XML, template).evaluate(data).nodes, expected);
  });

});
