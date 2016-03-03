import { deepEqual, equal } from 'assert';
import Xmlbuilder from 'xmlbuilder';
import Arrow from 'arrow';
import XML from 'arrow/documents/xml';
import b from 'arrow/builders';

describe('XML document helpers', () => {
  it('should render a basic document', () => {
    let arrow = new Arrow('element "stuff" ok="yes" { element "blah" ok="yes" { "hi!"; } }', XML);

    let actual = arrow.evaluate().render().toString();
    let expected = '<?xml version="1.0"?><stuff ok="yes"><blah ok="yes">hi!</blah></stuff>';
  
    deepEqual(actual, expected);
  });
  
  it('should render attributes constructed with helpers', () => {
    let arrow = new Arrow('element "stuff" { attribute "ok" { "yes"; } }', XML);

    let actual = arrow.evaluate().render().toString();
    let expected = '<?xml version="1.0"?><stuff ok="yes"/>';
  
    equal(actual, expected);
  });
  
  it('should accept namespaces specified as prefixes', () => {
    let arrow = new Arrow('element "stuff:blah" xmlns:stuff="http://example.com/stuff" { }', XML);

    let actual = arrow.evaluate().render().toString();
    let expected = '<?xml version="1.0"?><stuff:blah xmlns:stuff="http://example.com/stuff"/>';
  
    equal(actual, expected);
  });
  
  it('should render using a builder we pass to render if present', () => {
    let arrow = new Arrow('element "stuff";', XML);
    
    let builder = Xmlbuilder.create("root");
    arrow.evaluate().render(builder);

    let actual = builder.doc().toString();
    let expected = '<?xml version="1.0"?><root><stuff/></root>';
  
    equal(actual, expected);
  });
  
  it('should render, returning the xmlbuilder document', () => {
    let arrow = new Arrow('element "stuff" ok="yes" { element "blah" ok="yes" { "hi!"; } }', XML);
    
    let actual = arrow.evaluate().render().toString({ pretty: true });
    let expected = '<?xml version="1.0"?>\n<stuff ok="yes">\n  <blah ok="yes">hi!</blah>\n</stuff>';
  
    equal(actual, expected);
  });
  
  it('should interpret hash keys starting with @ as options rather than attributes', () => {
    let arrow = new Arrow('element "stuff" @whatever=123;', XML);
    
    let actual = arrow.evaluate().root.attributes;
    let expected = {};
    
    deepEqual(actual, expected);
  });
});

describe('Compact and keep', () => {
  it('should not remove an element containing data', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { first; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner>Someone</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element with a hash pair containing data', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" name=first; }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner name="Someone"/></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element with a name containing data', () => {
    let arrow = new Arrow('element "outer" @compact=true { element first; }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><Someone/></outer>';
    
    equal(actual, expected);
  });

  it('should remove an element containing nothing', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { last; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });

  it('should remove an element containing a string', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { "stuff"; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element marked keep', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" @keep=true { "Boilerplate"; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner>Boilerplate</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove attributes containing data', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "name" { first; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer name="Someone"/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an attributes with a name containing data', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute first { "etc"; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer Someone="etc"/>';
    
    equal(actual, expected);
  });
  
  it('should remove attributes containing nothing', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "name" { last; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should remove attributes containing a string', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "stuff" { "xyz"; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an attribute marked keep', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "stuff" @keep=true { "xyz"; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer stuff="xyz"/>';
    
    equal(actual, expected);
  });
  
  it('should keep an element if at least one child is marked as keep', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { element "etc"; element "stuff" @keep=true; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner><etc/><stuff/></inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should keep an element if at least one child is data', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { first; last; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner>Someone</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should keep an attribute if at least one child is data', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "stuff" { first; last; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer stuff="Someone"/>';
    
    equal(actual, expected);
  });
  
  it('should propagate the keep flag through multiple layers', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { element "stuff" { element "etc" @keep=true; } } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer><inner><stuff><etc/></stuff></inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should override @keep=true from a child if @keep=false', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" { element "stuff" @keep=false { element "etc" @keep=true; } } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should override elements containing data with @keep=false', () => {
    let arrow = new Arrow('element "outer" @compact=true { element "inner" @keep=false { first; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should override attributes containing data with @keep=false', () => {
    let arrow = new Arrow('element "outer" @compact=true { attribute "inner" @keep=false { first; } }', XML);
    
    let actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    let expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
});
