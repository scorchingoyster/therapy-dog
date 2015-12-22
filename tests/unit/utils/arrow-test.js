import Arrow from '../../../utils/arrow';
import { module, test } from 'qunit';

module('Unit | Utility | arrow');

test('it works', function(assert) {
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
