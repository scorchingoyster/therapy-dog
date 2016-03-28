'use strict';

var deepEqual = require('assert').deepEqual;
var Arrow = require('../../arrow');
var b = require('../../arrow/builders');

function parse(input) {
  var arrow = new Arrow(input);
  return arrow.program;
}

describe("Parser", function() {
  it("should parse literals", function() {
    deepEqual(parse('123;'), b.program([b.number(123)]));
    deepEqual(parse('true;'), b.program([b.boolean(true)]));
    deepEqual(parse('"abc";'), b.program([b.string('abc')]));
    deepEqual(parse("'abc';"), b.program([b.string('abc')]));
  });

  it("should parse identifiers", function() {
    deepEqual(parse('a1;'), b.program([b.call('a1')]));
    deepEqual(parse('@ok;'), b.program([b.call('@ok')]));
    deepEqual(parse('o-rly;'), b.program([b.call('o-rly')]));
    deepEqual(parse('_123;'), b.program([b.call('_123')]));
    deepEqual(parse('🐶;'), b.program([b.call('🐶')]));
    deepEqual(parse('ദൃക്‌സാക്ഷി;'), b.program([b.call('ദൃക്‌സാക്ഷി')]));
  });

  it("should parse calls", function() {
    deepEqual(parse('test;'),
      b.program([
        b.call('test')
      ])
    );

    deepEqual(parse('test true false;'),
      b.program([
        b.call(
          'test',
          [b.boolean(true), b.boolean(false)]
        )
      ])
    );
    
    deepEqual(parse('test x.y `x` y'),
      b.program([
        b.call('test', [b.path(['x', 'y']), b.path(['x']), b.call('y')])
      ])
    );

    deepEqual(parse('test "no" x=1 y="yes";'),
      b.program([
        b.call(
          'test',
          [b.string('no')],
          b.hash([b.pair('x', b.number(1)), b.pair('y', b.string('yes'))])
        )
      ])
    );
    
    deepEqual(parse('test a=x.y'),
      b.program([
        b.call('test', [], b.hash([b.pair('a', b.path(['x', 'y']))]))
      ])
    );
    
    deepEqual(parse('element "blah" xmlns:xlink="http://www.w3.org/1999/xlink";'),
      b.program([
        b.call(
          'element',
          [b.string('blah')],
          b.hash([b.pair('xmlns:xlink', b.string('http://www.w3.org/1999/xlink'))])
        )
      ])
    );
  });

  it("should parse calls with subexpression params", function() {
    deepEqual(parse('test (blah 123) (xyz true);'),
      b.program([
        b.call('test', [b.call('blah', [b.number(123)]), b.call('xyz', [b.boolean(true)])])
      ])
    );
  });

  it("should parse arrows", function() {
    deepEqual(parse('test -> blah "whatever" x=1;'),
      b.program([
        b.arrow(b.call('test'), [b.call('blah', [b.string('whatever')], b.hash([b.pair('x', b.number(1))]))])
      ])
    );
    
    deepEqual(parse('test 123 y=2 -> blah "whatever" x=1;'),
      b.program([
        b.arrow(
          b.call('test', [b.number(123)], b.hash([b.pair('y', b.number(2))])),
          [b.call('blah', [b.string('whatever')], b.hash([b.pair('x', b.number(1))]))]
        )
      ])
    );

    deepEqual(parse('test -> x y z;'),
      b.program([
        b.arrow(b.call('test'), [b.call('x', [b.call('y'), b.call('z')])])
      ])
    );

    deepEqual(parse('123 -> x;'),
      b.program([
        b.arrow(b.number(123), [b.call('x')])
      ])
    );

    deepEqual(parse('x.y -> x;'),
      b.program([
        b.arrow(b.path(['x', 'y']), [b.call('x')])
      ])
    );

    deepEqual(parse('test -> (x 1) (y) (z);'),
      b.program([
        b.arrow(b.call('test'), [b.call('x', [b.number(1)]), b.call('y'), b.call('z')])
      ])
    );

    deepEqual(parse('123 -> ( x ) ( y ) ( z )'),
      b.program([
        b.arrow(b.number('123'), [b.call('x'), b.call('y'), b.call('z')])
      ])
    );

    deepEqual(parse('(a { b }) -> y'),
      b.program([
        b.arrow(b.call('a', [], b.hash(), [], b.program([b.call('b')])), [b.call('y')])
      ])
    );

    deepEqual(parse('partial "x" y=1 -> z'),
      b.program([
        b.arrow(b.partial(b.string('x'), b.hash([b.pair('y', b.number(1))])), [b.call('z')])
      ])
    );
  });

  it("should parse paths", function() {
    deepEqual(parse('x.y.z;'),
      b.program([
        b.path(['x', 'y', 'z'])
      ])
    );
    
    deepEqual(parse('`zap!`.`pow!`.blam;'),
      b.program([
        b.path(['zap!', 'pow!', 'blam'])
      ])
    );
    
    deepEqual(parse('`#ok`;'),
      b.program([
        b.path(['#ok'])
      ])
    );
  });

  it("should parse program bodies", function() {
    deepEqual(parse(''), b.program([]));

    deepEqual(parse('x;\n'),
      b.program([
        b.call('x')
      ])
    );

    deepEqual(parse('x;\ny;\nz;\n'),
      b.program([
        b.call('x'),
        b.call('y'),
        b.call('z')
      ])
    );

    deepEqual(parse('test { x;\n y;\n z;\n }\n'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([
          b.call('x'),
          b.call('y'),
          b.call('z')
        ]))
      ])
    );

    deepEqual(parse('test {\n  \n  x;\n}\n'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([
          b.call('x')
        ]))
      ])
    );

    deepEqual(parse('test {\n  # comment breaking up whitespace\n  x; # another\n  y;\n}\n'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([
          b.call('x'),
          b.call('y')
        ]))
      ])
    );

    deepEqual(parse('test { x; }\ntest { y; }\n'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([
          b.call('x')
        ])),
        b.call('test', [], b.hash(), [], b.program([
          b.call('y')
        ]))
      ])
    );

    deepEqual(parse('test { } else { }\ntest { }'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([]), b.program([])),
        b.call('test', [], b.hash(), [], b.program([]))
      ])
    );
  });

  it("should strip comments", function() {
    deepEqual(parse('x; # the unknown quantity\ny; # indeed\nz; # rhymes with bed'),
      b.program([
        b.call('x'),
        b.call('y'),
        b.call('z')
      ])
    );
  });

  it("should parse blocks", function() {
    deepEqual(parse('test { 123; }'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([b.number(123)]))
      ])
    );

    deepEqual(parse('each blah as |x y| { x; }'),
      b.program([
        b.call('each', [b.call('blah')], b.hash(), ['x', 'y'], b.program([b.call('x')]))
      ])
    );

    deepEqual(parse('if true { x; } else if false { y; } else { z; }'),
      b.program([
        b.call('if', [b.boolean(true)], b.hash(), [], b.program([
          b.call('x')
        ]), b.call('if', [b.boolean(false)], b.hash(), [], b.program([
          b.call('y')
        ]), b.program([
          b.call('z')
        ])))
      ])
    );
  });

  it("should ignore empty statements", function() {
    deepEqual(parse('test { };;test { };;'),
      b.program([
        b.call('test', [], b.hash(), [], b.program()),
        b.call('test', [], b.hash(), [], b.program())
      ])
    );
  });

  it("should treat semicolons as optional", function() {
    deepEqual(parse('test'),
      b.program([
        b.call('test')
      ])
    );

    deepEqual(parse('test\ntest\n'),
      b.program([
        b.call('test'),
        b.call('test')
      ])
    );

    deepEqual(parse('test "abc"\ntest (test)\ntest 123\ntest\n'),
      b.program([
        b.call('test', [b.string('abc')]),
        b.call('test', [b.call('test')]),
        b.call('test', [b.number(123)]),
        b.call('test')
      ])
    );

    deepEqual(parse('test { test }'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([
          b.call('test')
        ]))
      ])
    );
  });

  it("should parse partials", function() {
    deepEqual(parse('partial "thing";'),
      b.program([
        b.partial(b.string('thing'))
      ])
    );
    
    deepEqual(parse('partial "thing" x=y;'),
      b.program([
        b.partial(b.string('thing'), b.hash([b.pair('x', b.call('y'))]))
      ])
    );
    
    deepEqual(parse('partial thing;'),
      b.program([
        b.partial(b.call('thing'))
      ])
    );
    
    deepEqual(parse('partial (thing 123);'),
      b.program([
        b.partial(b.call('thing', [b.number(123)]))
      ])
    );
  });
});
