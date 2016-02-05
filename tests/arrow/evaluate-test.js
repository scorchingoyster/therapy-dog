var assert = require('assert');
var Arrow = require('../../lib/arrow');
var b = require('../../lib/arrow/builders');
var unwrapData = require('../../lib/arrow/utils').unwrapData;

function Doc(nodes) {
  this.nodes = nodes;
}

Doc.helpers = {
  thing: function(params, hash, context, content) {
    var name = unwrapData(params[0]);
    var stuff = unwrapData(hash.stuff);
    
    return {
      type: 'thing',
      name: name ? name : null,
      stuff: stuff ? stuff : false,
      content: content.body()
    };
  },
  
  echo: function(params, hash, context, content) {
    return {
      type: 'echo',
      content: content.body()
    };
  }
};

describe("Arrow evaluation", function() {

  it("should evaluate literals", function() {
    // 123; "abc"; true
    var template = b.program([b.number(123), b.string("abc"), b.boolean(true)]);

    var data = {};

    var expected = [123, 'abc', true];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("should evaluate a simple path", function() {
    // x.y
    var template = b.program([b.path(['x', 'y'])]);
    var data = { x: { y: "abc" } };
    var expected = [{ type: 'data', value: 'abc' }];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("should evaluate a call which corresponds to a key in data", function() {
    // name
    var template = b.program([b.call('stuff')]);
    var data = { stuff: ['abc', 'def'] };
    var expected = [{ type: 'data', value: ['abc', 'def'] }];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("a path to something that doesn't exist should evaluate to nothing", function() {
    // names.blah
    var template = b.program([b.path(['stuff', 'blah'])]);
    var data = { stuff: ['abc', 'def'] };
    var expected = [];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("a call to something that doesn't exist in data should evaluate to nothing", function() {
    // blah
    var template = b.program([b.call('blah')]);
    var data = { stuff: ['abc', 'def'] };
    var expected = [];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("the with helper should yield its param", function() {
    // with stuff as |s| { s }
    var template = b.program([b.call('with', [b.call('stuff')], b.hash(), ['s'], b.program([b.call('s')]))]);
    var data = { stuff: 'xyz' };
    var expected = [{ type: 'data', value: 'xyz' }];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("the with helper should work with the result of another helper as input", function() {
    // with (thing "whatever") as |t| { t }
    var template = b.program([b.call('with', [b.call('thing', [b.string('whatever')])], b.hash(), ['t'], b.program([b.call('t')]))]);
    var data = {};
    var expected = [{ type: 'thing', name: 'whatever', stuff: false, content: [] }];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("the each helper should evaluate its body for each item, yielding the item and index", function() {
    // each list as |item index| {
    //   index
    //   item
    // }
    var template = b.program([
      b.call('each', [b.call('list')], b.hash(), ['item', 'index'], b.program([
        b.call('index'),
        b.call('item')
      ]))
    ]);

    var data = { list: [ 'abc', 'def' ] };

    var expected = [
      0, { type: 'data', value: 'abc' },
      1, { type: 'data', value: 'def' }
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("when evaluating the each helper, properties not in the list of locals may be referenced", function() {
    // each list as |item index| {
    //   item.x
    //   y
    // }
    var template = b.program([
      b.call('each', [b.call('list')], b.hash(), ['item', 'index'], b.program([
        b.path(['item', 'x']),
        b.call(['y'])
      ]))
    ]);

    var data = { list: [ { x: 'abc' } ], y: 'stuff' };

    var expected = [
      { type: 'data', value: 'abc' },
      { type: 'data', value: 'stuff' }
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("the if helper should create output for the body if the param is truthy, otherwise the inverse", function() {
    // if good { "ok!" } else { "not ok" }
    // if bad { "not ok" } else { "ok!!" }
    var template = b.program([
      b.call('if', [b.call('good')], b.hash(), [], b.program([
        b.string('ok!')
      ]), b.program([
        b.string('not ok')
      ])),
      b.call('if', [b.call('bad')], b.hash(), [], b.program([
        b.string('not ok')
      ]), b.program([
        b.string('ok!!')
      ]))
    ]);

    var data = { good: true, bad: false };

    var expected = [
      'ok!',
      'ok!!'
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("should be able to chain the if helper", function() {
    // if good { "good!" } else if bad { "bad..." } else { "ok" }
    var template = b.program([
      b.call('if', [b.call('good')], b.hash(), [], b.program([
        b.string('good!')
      ]), b.call('if', [b.call('bad')], b.hash(), [], b.program([
        b.string('bad...')
      ]), b.program([
        b.string('ok')
      ])))
    ]);

    var arrow = new Arrow(Doc, template);

    assert.deepEqual(arrow.evaluate({ good: false, bad: false }).nodes, ['ok']);
    assert.deepEqual(arrow.evaluate({ good: true, bad: false }).nodes, ['good!']);
    assert.deepEqual(arrow.evaluate({ good: false, bad: true }).nodes, ['bad...']);
  });

  it("should call document helpers and provide them with content", function() {
    // thing "whatever" stuff=true {
    //   thing "blah" { x }
    //   y
    // }
    var template = b.program([
      b.call('thing', [b.string('whatever')], b.hash([b.pair('stuff', b.boolean(true))]), [], b.program([
        b.call('thing', [b.string('blah')], b.hash(), [], b.program([
          b.call('x')
        ])),
        b.call('y')
      ]))
    ]);

    var data = { x: "abc", y: "def" };

    var expected = [
      {
        type: "thing",
        name: "whatever",
        stuff: true,
        content: [
          {
            type: "thing",
            name: "blah",
            stuff: false,
            content: [
              { type: "data", value: "abc" }
            ]
          },
          { type: "data", value: "def" }
        ]
      }
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });
  
  it.skip("should evaluate registered partial templates", function() {
    // partial "inner" -> thing "blah"
    var outer = new Arrow(Doc, b.program([
      b.arrow(b.call("partial", [b.string("inner")]), [b.call("thing", [b.string("blah")])])
    ]));
    
    // thing x
    var inner = new Arrow(Doc, b.program([
      b.call("thing", [b.call("x")])
    ]));
    
    outer.registerPartial("inner", inner);
    
    var data = { x: "abc" };
    
    var expected = [
      {
        type: "thing",
        name: "blah",
        stuff: false,
        content: [
          {
            type: "thing",
            name: "abc",
            stuff: false,
            content: []
          }
        ]
      }
    ];
    
    assert.deepEqual(outer.evaluate(data).nodes, expected);
  });

  it("an arrow should put list items inside nested instances of the target", function() {
    // role -> (thing "abc") (thing "def")
    var template = b.program([
      b.arrow(b.call('role'), [b.call('thing', [b.string('abc')]), b.call('thing', [b.string('def')])])
    ]);

    var data = { role: ["one", "two"] };

    var expected = [
      {
        type: "thing",
        name: "abc",
        stuff: false,
        content: [
          {
            type: "thing",
            name: "def",
            stuff: false,
            content: [
              { type: "data", value: "one" }
            ]
          }
        ]
      },
      {
        type: "thing",
        name: "abc",
        stuff: false,
        content: [
          {
            type: "thing",
            name: "def",
            stuff: false,
            content: [
              { type: "data", value: "two" }
            ]
          }
        ]
      }
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("a helper should work as the source of an arrow", function() {
    // thing "whatever" -> thing "blah"
    var template = b.program([
      b.arrow(b.call('thing', [b.string('whatever')]), [b.call('thing', [b.string('blah')])])
    ]);

    var data = {};

    var expected = [
      {
        type: "thing",
        name: "blah",
        stuff: false,
        content: [
          {
            type: "thing",
            name: "whatever",
            stuff: false,
            content: []
          }
        ]
      }
    ];

    assert.deepEqual(new Arrow(Doc, template).evaluate(data).nodes, expected);
  });

  it("an arrow with an empty source should output nothing", function() {
    // x -> echo
    var template = b.program([
      b.arrow(b.call('x'), [b.call('echo')])
    ]);

    var arrow = new Arrow(Doc, template);

    assert.deepEqual(arrow.evaluate({}).nodes, []);
    assert.deepEqual(arrow.evaluate({ x: false }).nodes, []);
    assert.deepEqual(arrow.evaluate({ x: null }).nodes, []);
    assert.deepEqual(arrow.evaluate({ x: undefined }).nodes, []);
    assert.deepEqual(arrow.evaluate({ x: "" }).nodes, []);
    assert.deepEqual(arrow.evaluate({ x: [] }).nodes, []);
  });

  it("an arrow with a nonempty source should output the literal", function() {
    // x -> echo
    var template = b.program([
      b.arrow(b.call('x'), [b.call('echo')])
    ]);

    var arrow = new Arrow(Doc, template);

    assert.deepEqual(arrow.evaluate({ x: true }).nodes, [{ type: "echo", content: [ { type: 'data', value: true } ] }]);
    assert.deepEqual(arrow.evaluate({ x: 1 }).nodes, [{ type: "echo", content: [ { type: 'data', value: 1 } ] }]);
    assert.deepEqual(arrow.evaluate({ x: 0 }).nodes, [{ type: "echo", content: [ { type: 'data', value: 0 } ] }]);
  });

  it("an arrow with an array source should output the nonempty elements of the array", function() {
    // x -> echo
    var template = b.program([
      b.arrow(b.call('x'), [b.call('echo')])
    ]);

    var arrow = new Arrow(Doc, template);

    assert.deepEqual(arrow.evaluate({ x: [true, false] }).nodes, [{ type: "echo", content: [ { type: 'data', value: true } ] }]);
    assert.deepEqual(arrow.evaluate({ x: ["", "a"] }).nodes, [{ type: "echo", content: [ { type: 'data', value: "a" } ] }]);
    assert.deepEqual(arrow.evaluate({ x: [null, undefined, 1] }).nodes, [{ type: "echo", content: [ { type: 'data', value: 1 } ] }]);
  });

});
