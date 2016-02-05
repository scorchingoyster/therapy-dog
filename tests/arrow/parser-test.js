var assert = require('assert');
var parser = require('../../lib/arrow/parser');
var b = require('../../lib/arrow/builders');

describe("Arrow parser", function() {

  it("should parse literals", function() {
    assert.deepEqual(parser.parse('123'), b.program([b.number(123)]));
    assert.deepEqual(parser.parse('true'), b.program([b.boolean(true)]));
    assert.deepEqual(parser.parse('"abc"'), b.program([b.string('abc')]));
    assert.deepEqual(parser.parse("'abc'"), b.program([b.string('abc')]));
  });

  it("should parse identifiers", function() {
    assert.deepEqual(parser.parse('a1'), b.program([b.call('a1')]));
    assert.deepEqual(parser.parse('@ok'), b.program([b.call('@ok')]));
    assert.deepEqual(parser.parse('_123'), b.program([b.call('_123')]));
    assert.deepEqual(parser.parse('🐶'), b.program([b.call('🐶')]));
    assert.deepEqual(parser.parse('ദൃക്‌സാക്ഷി'), b.program([b.call('ദൃക്‌സാക്ഷി')]));
  });

  it("should parse calls", function() {
    assert.deepEqual(parser.parse('test'),
      b.program([
        b.call('test')
      ])
    );
  
    assert.deepEqual(parser.parse('test true false'),
      b.program([
        b.call(
          'test',
          [b.boolean(true), b.boolean(false)]
        )
      ])
    );
  
    assert.deepEqual(parser.parse('test "no" x=1 y="yes"'),
      b.program([
        b.call(
          'test',
          [b.string('no')],
          b.hash([b.pair('x', b.number(1)), b.pair('y', b.string('yes'))])
        )
      ])
    );
  });

  it("should parse calls with call params", function() {
    assert.deepEqual(parser.parse('test (blah 123)'),
      b.program([
        b.call(
          'test',
          [b.call('blah', [b.number(123)])]
        )
      ])
    );
  });

  it("should parse arrows", function() {
    assert.deepEqual(parser.parse('test -> blah "whatever"'),
      b.program([
        b.arrow(b.call('test'), [b.call('blah', [b.string('whatever')])])
      ])
    );
  
    assert.deepEqual(parser.parse('test -> x y z'),
      b.program([
        b.arrow(b.call('test'), [b.call('x', [b.call('y'), b.call('z')])])
      ])
    );
  
    assert.deepEqual(parser.parse('test -> (x) (y) (z)'),
      b.program([
        b.arrow(b.call('test'), [b.call('x'), b.call('y'), b.call('z')])
      ])
    );
  });

  it("should parse paths", function() {
    assert.deepEqual(parser.parse('x.y.z'),
      b.program([
        b.path(['x', 'y', 'z'])
      ])
    );
  });

  it.skip("should parse program bodies", function() {
    assert.deepEqual(parser.parse(''), b.program([]));

    assert.deepEqual(parser.parse('x\n'),
      b.program([
        b.call('x')
      ])
    );

    assert.deepEqual(parser.parse('x\ny\nz\n'),
      b.program([
        b.call('x'),
        b.call('y'),
        b.call('z')
      ])
    );

    assert.deepEqual(parser.parse('test { x; y; z }'),
      b.program([
        b.call('test', [], b.hash(), [
          b.call('x'),
          b.call('y'),
          b.call('z')
        ])
      ])
    );
  });

  it("should parse blocks", function() {
    assert.deepEqual(parser.parse('test { 123 }'),
      b.program([
        b.call('test', [], b.hash(), [], b.program([b.number(123)]))
      ])
    );
  
    assert.deepEqual(parser.parse('each blah as |x y| { x }'),
      b.program([
        b.call('each', [b.call('blah')], b.hash(), ['x', 'y'], b.program([b.call('x')]))
      ])
    );
  
    assert.deepEqual(parser.parse('if true { x } else if false { y } else { z }'),
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

});
