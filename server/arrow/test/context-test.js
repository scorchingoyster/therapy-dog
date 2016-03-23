import Context from 'arrow/context';
import { deepEqual } from 'assert';

describe('Contexts', () => {
  it('should retrieve paths from a context', () => {
    var context = new Context({ x: { y: 123 } });

    deepEqual({ value: { y: 123 }, data: true }, context.get(["x"]));
    deepEqual({ value: 123, data: true }, context.get(["x", "y"]));
  });
  
  it('should retrieve path when a frame is added to the context', () => {
    var context = new Context({ x: { y: 123 } });
    context = context.concat({ v: context.get(["x", "y"]), w: { value: 456, data: false } });
    
    deepEqual({ value: 123, data: true }, context.get("v"));
    deepEqual({ value: 456, data: false }, context.get("w"));
    deepEqual({ value: 123, data: true }, context.get(["v"]));
    deepEqual({ value: 456, data: false }, context.get(["w"]));
    deepEqual({ value: 123, data: true }, context.get(["x", "y"]));
  });
  
  it('should retrieve undefined values', () => {
    var context = new Context({ x: { y: 123 } });

    deepEqual({ value: undefined, data: false }, context.get("blah"));
    deepEqual({ value: undefined, data: true }, context.get(["x", "blah"]));
  });
  
  it('should retrieve values for getters defined on prototypes', () => {
    class X {
      get a() {
        return 123;
      }
    }
    
    var context = new Context({ x: new X() });

    deepEqual({ value: 123, data: true }, context.get(["x", "a"]));
  });
});
