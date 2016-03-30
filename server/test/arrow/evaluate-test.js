'use strict';

const Arrow = require('../../lib/arrow');
const deepEqual = require('assert').deepEqual;
const registerTestHelpers = require('./test-helpers').registerTestHelpers;

describe('Evaluate', function() {
  it('should evaluate a helper, calls, and literals', function() {
    let arrow = new Arrow('repeat 2 { "hello"; }; repeat 2 { number; }; repeat 2 { letters; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ number: 123, letters: ['x', 'y'] });
    let expected = ['hello', 'hello', 123, 123, 'x', 'y', 'x', 'y'];

    deepEqual(actual, expected);
  });

  it('should evaluate quoted strings', function() {
    let arrow = new Arrow('"\\\\hello\\r\\nworld\\\'\\"";');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate();
    let expected = ['\\hello\r\nworld\'\"'];

    deepEqual(actual, expected);
  });

  it('should evaluate a helper with a hash', function() {
    let arrow = new Arrow('element "blah" type="stuff" { "hello"; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate();
    let expected = [
      {
        type: 'element',
        name: 'blah',
        attributes: {
          type: 'stuff'
        },
        children: [
          'hello'
        ]
      }
    ];

    deepEqual(actual, expected);
  });

  it('should provide an empty body to a helper when the template specifies no body', function() {
    let arrow = new Arrow('element "blah";');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate();
    let expected = [
      {
        type: 'element',
        name: 'blah',
        attributes: {},
        children: []
      }
    ];

    deepEqual(actual, expected);
  });

  it('should evaluate a basic concat helper', function() {
    let arrow = new Arrow('concat letter "!";');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ letter: 'x' });
    let expected = ['x!'];

    deepEqual(actual, expected);
  });

  it('should evaluate inverse blocks, and be able to chain inverse blocks', function() {
    let arrow = new Arrow('contrary { "yes"; } else contrary { "maybe?"; } else { "no"; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate();
    let expected = ['no'];

    deepEqual(actual, expected);
  });

  it('should ignore extra locals', function() {
    let arrow = new Arrow('each letters as |letter index blah| { letter; index; }');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ letters: ['x', 'y'] });
    let expected = ['x', 0, 'y', 1];

    deepEqual(actual, expected);
  });

  it('should put list items inside the nested instances of an arrow\'s target', function() {
    let arrow = new Arrow('letters -> (element "abc" a=1) (element "def" b=2);');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ letters: ['x', 'y'] });
    let expected = [
      {
        type: 'element',
        name: 'abc',
        attributes: { a: 1 },
        children: [
          {
            type: 'element',
            name: 'def',
            attributes: { b: 2 },
            children: ['x']
          }
        ]
      },
      {
        type: 'element',
        name: 'abc',
        attributes: { a: 1 },
        children: [
          {
            type: 'element',
            name: 'def',
            attributes: { b: 2 },
            children: ['y']
          }
        ]
      }
    ];

    deepEqual(actual, expected);
  });

  it('should put the nonempty source of an arrow inside its target', function() {
    let arrow = new Arrow('x -> echo;');
    registerTestHelpers(arrow);

    deepEqual(arrow.evaluate({ x: true }), [{ type: 'echo', body: [true] }]);
    deepEqual(arrow.evaluate({ x: 1 }), [{ type: 'echo', body: [1] }]);
    deepEqual(arrow.evaluate({ x: 0 }), [{ type: 'echo', body: [0] }]);
  });

  it('should output nothing for an arrow with an empty source', function() {
    let arrow = new Arrow('x -> echo;');
    registerTestHelpers(arrow);

    deepEqual(arrow.evaluate({}), []);
    deepEqual(arrow.evaluate({ x: false }), []);
    deepEqual(arrow.evaluate({ x: null }), []);
    deepEqual(arrow.evaluate({ x: undefined }), []);
    deepEqual(arrow.evaluate({ x: '' }), []);
    deepEqual(arrow.evaluate({ x: [] }), []);
  });

  it('should output only the nonempty elements of an arrow\'s array source', function() {
    let arrow = new Arrow('x -> echo;');
    registerTestHelpers(arrow);

    deepEqual(arrow.evaluate({ x: [true, true, false] }), [{ type: 'echo', body: [true] }, { type: 'echo', body: [true] }]);
    deepEqual(arrow.evaluate({ x: ['', 'a', 'b'] }), [{ type: 'echo', body: ['a'] }, { type: 'echo', body: ['b'] }]);
    deepEqual(arrow.evaluate({ x: [null, undefined, 1, 2] }), [{ type: 'echo', body: [1] }, { type: 'echo', body: [2] }]);
  });

  it('should just output the items of an arrow\'s source if it has no target', function() {
    let arrow = new Arrow('letters ->;');
    registerTestHelpers(arrow);

    deepEqual(arrow.evaluate({ letters: ['a', 'b'] }), ['a', 'b']);
  });

  it('should accept a helper as the source of an arrow', function() {
    let arrow = new Arrow('element "whatever" x=1 -> element "blah" y=2;');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({});
    let expected = [
      {
        type: 'element',
        name: 'blah',
        attributes: { y: 2 },
        children: [
          {
            type: 'element',
            name: 'whatever',
            attributes: { x: 1 },
            children: []
          }
        ]
      }
    ];

    deepEqual(actual, expected);
  });

  it('should evaluate a path', function() {
    let arrow = new Arrow('x.y;');
    registerTestHelpers(arrow);

    let actual = arrow.evaluate({ x: { y: 123 } });
    let expected = [123];

    deepEqual(actual, expected);
  });
});
