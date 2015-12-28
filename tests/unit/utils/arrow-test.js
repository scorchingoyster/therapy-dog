import Arrow from '../../../utils/arrow';
import { module, test } from 'qunit';

module('Unit | Utility | arrow');

test('should evaluate a simple path', function(assert) {
  // x.y
  var template = [
    { type: "path", parts: ["x", "y"] }
  ];

  var context = { "x": { "y": "abc" } };

  var expected = ["abc"];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("should evaluate a path to an array of strings", function(assert) {
  // names
  var template = [
    { type: "path", parts: ["names"] }
  ];

  var context = { "names": ["abc", "def"] };

  var expected = ["abc", "def"];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("a path to something that doesn't exist should evalute to empty output", function(assert) {
  // names.blah
  var template = [
    { type: "path", parts: ["names", "blah"] }
  ];

  var context = { "names": ["abc", "def"] };

  var expected = [];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("an arrow should evaluate the source, create a target for each item, and put evaluated children inside the target", function(assert) {
  // names as |name| -> <name>
  //   <firstName>
  //     name.first
  var template = [
    {
      type: "arrow",
      source: {
        type: "path",
        parts: ["names"]
      },
      target: [
        {
          type: "element",
          name: "name"
        }
      ],
      variable: "name",
      children: [
        {
          type: "element",
          name: "namePart",
          children: [
            {
              type: "path",
              parts: ["name", "first"]
            }
          ]
        }
      ]
    }
  ];

  var context = { names: [ { first: "abc" }, { first: "def" } ] };

  var expected = [
    {
      type: "element",
      name: "name",
      attributes: {},
      children: [
        {
          type: "element",
          name: "namePart",
          attributes: {},
          children: ["abc"]
        }
      ]
    },
    {
      type: "element",
      name: "name",
      attributes: {},
      children: [
        {
          type: "element",
          name: "namePart",
          attributes: {},
          children: ["def"]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("an arrow without children should just put the evaluated item inside the target", function(assert) {
  // role -> <role> <roleTerm>
  var template = [
    {
      type: "arrow",
      source: {
        type: "path",
        parts: ["role"]
      },
      target: [
        {
          type: "element",
          name: "role"
        },
        {
          type: "element",
          name: "roleTerm"
        }
      ]
    }
  ];

  var context = { "role": ["Author", "Editor"] };

  var expected = [
    {
      type: "element",
      name: "role",
      attributes: {},
      children: [
        {
          type: "element",
          name: "roleTerm",
          attributes: {},
          children: ["Author"]
        }
      ]
    },
    {
      type: "element",
      name: "role",
      attributes: {},
      children: [
        {
          type: "element",
          name: "roleTerm",
          attributes: {},
          children: ["Editor"]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("an arrow evaluating to the empty string should be equivalent to no value", function(assert) {
  // first -> <namePart>
  var template = [
    {
      type: "arrow",
      source: {
        type: "path",
        parts: ["first"]
      },
      target: [
        {
          type: "element",
          name: "namePart"
        }
      ]
    }
  ];

  var context = { first: "" };

  var expected = [];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, should remove children implicitly not marked for keeping", function(assert) {
  // <mods> (compact)
  //   <name>
  //     first -> <namePart type="given">
  //     <role>
  //       <roleTerm>
  //         "Creator"
  var template = [
    {
      type: "element",
      name: "mods",
      compact: true,
      children: [
        {
          type: "element",
          name: "name",
          children: [
            {
              type: "arrow",
              source: {
                type: "path",
                parts: ["first"]
              },
              target: [
                {
                  type: "element",
                  name: "namePart"
                }
              ]
            },
            {
              type: "element",
              name: "role",
              children: [
                {
                  type: "element",
                  name: "roleTerm",
                  children: [
                    {
                      type: "string",
                      value: "Creator"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  var context = {};
  
  // <mods>
  var expected = [
    {
      type: "element",
      name: "mods",
      attributes: {},
      children: []
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, should not remove children explicitly marked for keeping", function(assert) {
  // <mods> (compact)
  //   <accessCondition> (keep)
  //     "(c) 2015"
  //   <titleInfo>
  //     title -> <title>
  var template = [
    {
      type: "element",
      name: "mods",
      compact: true,
      children: [
        {
          type: "element",
          name: "accessCondition",
          keep: true,
          children: [
            {
              type: "string",
              value: "(c) 2015"
            }
          ]
        },
        {
          type: "element",
          name: "titleInfo",
          children: [
            {
              type: "arrow",
              source: {
                type: "path",
                parts: ["title"]
              },
              target: [
                {
                  type: "element",
                  name: "title"
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  var context = {};
  
  // <mods>
  //   <accessCondition>
  //     "(c) 2015"
  var expected = [
    {
      type: "element",
      name: "mods",
      attributes: {},
      children: [
        {
          type: "element",
          name: "accessCondition",
          attributes: {},
          children: ["(c) 2015"]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, a child is kept if at least one of its children are marked for keeping", function(assert) {
  // <mods> (compact)
  //   <titleInfo>
  //     title -> <title>
  //     issue -> <partName>
  //     @displayLabel
  //       "Journal Title"
  var template = [
    {
      type: "element",
      name: "mods",
      compact: true,
      children: [
        {
          type: "element",
          name: "titleInfo",
          children: [
            {
              type: "arrow",
              source: {
                type: "path",
                parts: ["title"]
              },
              target: [
                {
                  type: "element",
                  name: "title"
                }
              ]
            },
            {
              type: "attribute",
              name: "displayLabel",
              children: [
                {
                  type: "string",
                  value: "Journal Title"
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  var context = { title: "Nature Reviews Socks" };
  
  // <mods>
  //   <titleInfo>
  //     <title>
  //       "Nature Reviews Socks"
  //     @displayLabel
  //       "Journal Title"
  var expected = [
    {
      type: "element",
      name: "mods",
      attributes: {},
      children: [
        {
          type: "element",
          name: "titleInfo",
          attributes: {},
          children: [
            {
              type: "element",
              name: "title",
              attributes: {},
              children: [
                "Nature Reviews Socks"
              ]
            },
            {
              type: "attribute",
              name: "displayLabel",
              children: [
                "Journal Title"
              ]
            }
          ]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("string children work with compact elements", function(assert) {
  // <stuff> (compact)
  //   x
  var template = [
    {
      type: "element",
      name: "stuff",
      compact: true,
      children: [
        {
          type: "path",
          parts: ["x"]
        }
      ]
    }
  ];

  var context = { x: "123" };

  var expected = [
    {
      type: "element",
      name: "stuff",
      attributes: {},
      children: ["123"]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, the result of evaluating a path is implicitly kept", function(assert) {
  // <stuff> (compact)
  //   <a>
  //     x
  var template = [
    {
      type: "element",
      name: "stuff",
      compact: true,
      children: [
        {
          type: "element",
          name: "a",
          children: [
            {
              type: "path",
              parts: ["x"]
            }
          ]
        }
      ]
    }
  ];

  var context = { x: "123" };

  var expected = [
    {
      type: "element",
      name: "stuff",
      attributes: {},
      children: [
        {
          type: "element",
          name: "a",
          attributes: {},
          children: ["123"]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, an arrow with children is not necessarily kept", function(assert) {
  // <mods> (compact)
  //   authors as |author| -> <name>
  //     author.first -> <namePart>
  //     <role>
  //       <roleTerm>
  //         "Creator"
  var template = [
    {
      type: "element",
      name: "mods",
      compact: true,
      children: [
        {
          type: "arrow",
          source: {
            type: "path",
            parts: ["authors"]
          },
          target: [
            {
              type: "element",
              name: "name"
            }
          ],
          variable: "author",
          children: [
            {
              type: "arrow",
              source: {
                type: "path",
                parts: ["author", "first"]
              },
              target: [
                {
                  type: "element",
                  name: "namePart"
                }
              ]
            },
            {
              type: "element",
              name: "role",
              children: [
                {
                  type: "element",
                  name: "roleTerm",
                  children: [
                    {
                      type: "string",
                      value: "Creator"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  var context = { authors: [{}] };
  
  // <mods>
  var expected = [
    {
      type: "element",
      name: "mods",
      attributes: {},
      children: []
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});

test("for a compact element, an arrow with children is kept if one of its children is kept", function(assert) {
  // <mods> (compact)
  //   authors as |author| -> <name>
  //     author.first -> <namePart>
  //     <role>
  //       <roleTerm>
  //         "Creator"
  var template = [
    {
      type: "element",
      name: "mods",
      compact: true,
      children: [
        {
          type: "arrow",
          source: {
            type: "path",
            parts: ["authors"]
          },
          target: [
            {
              type: "element",
              name: "name"
            }
          ],
          variable: "author",
          children: [
            {
              type: "arrow",
              source: {
                type: "path",
                parts: ["author", "first"]
              },
              target: [
                {
                  type: "element",
                  name: "namePart"
                }
              ]
            },
            {
              type: "element",
              name: "role",
              children: [
                {
                  type: "element",
                  name: "roleTerm",
                  children: [
                    {
                      type: "string",
                      value: "Creator"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  var context = { authors: [{ first: "Someone" }] };
  
  // <mods>
  //   <name>
  //     <namePart>
  //       "Someone"
  //     <role>
  //       <roleTerm>
  //         "Creator"
  var expected = [
    {
      type: "element",
      name: "mods",
      attributes: {},
      children: [
        {
          type: "element",
          name: "name",
          attributes: {},
          children: [
            {
              type: "element",
              name: "namePart",
              attributes: {},
              children: ["Someone"]
            },
            {
              type: "element",
              name: "role",
              attributes: {},
              children: [
                {
                  type: "element",
                  name: "roleTerm",
                  attributes: {},
                  children: ["Creator"]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  assert.deepEqual(new Arrow(template).evaluate(context), expected);
});
