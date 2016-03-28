'use strict';

var deepEqual = require('assert').deepEqual;
var equal = require('assert').equal;
var Xmlbuilder = require('xmlbuilder');
var Arrow = require('../../../arrow');
var XML = require('../../../arrow/documents/xml');
var b = require('../../../arrow/builders');

describe('XML document helpers', function() {
  it('should render a basic document', function() {
    var arrow = new Arrow('element "stuff" ok="yes" { element "blah" ok="yes" { "hi!"; } }', XML);

    var actual = arrow.evaluate().render().toString();
    var expected = '<?xml version="1.0"?><stuff ok="yes"><blah ok="yes">hi!</blah></stuff>';
  
    deepEqual(actual, expected);
  });
  
  it('should render attributes constructed with helpers', function() {
    var arrow = new Arrow('element "stuff" { attribute "ok" { "yes"; } }', XML);

    var actual = arrow.evaluate().render().toString();
    var expected = '<?xml version="1.0"?><stuff ok="yes"/>';
  
    equal(actual, expected);
  });
  
  it('should accept namespaces specified as prefixes', function() {
    var arrow = new Arrow('element "stuff:blah" xmlns:stuff="http://example.com/stuff" { }', XML);

    var actual = arrow.evaluate().render().toString();
    var expected = '<?xml version="1.0"?><stuff:blah xmlns:stuff="http://example.com/stuff"/>';
  
    equal(actual, expected);
  });
  
  it('should render using a builder we pass to render if present', function() {
    var arrow = new Arrow('element "stuff";', XML);
    
    var builder = Xmlbuilder.create("root");
    arrow.evaluate().render(builder);

    var actual = builder.doc().toString();
    var expected = '<?xml version="1.0"?><root><stuff/></root>';
  
    equal(actual, expected);
  });
  
  it('should render, returning the xmlbuilder document', function() {
    var arrow = new Arrow('element "stuff" ok="yes" { element "blah" ok="yes" { "hi!"; } }', XML);
    
    var actual = arrow.evaluate().render().toString({ pretty: true });
    var expected = '<?xml version="1.0"?>\n<stuff ok="yes">\n  <blah ok="yes">hi!</blah>\n</stuff>';
  
    equal(actual, expected);
  });
  
  it('should interpret hash keys starting with @ as options rather than attributes', function() {
    var arrow = new Arrow('element "stuff" @whatever=123;', XML);
    
    var actual = arrow.evaluate().root.attributes;
    var expected = {};
    
    deepEqual(actual, expected);
  });
});

describe('Compact and keep', function() {
  it('should not remove an element containing data', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { first; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner>Someone</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element with a hash pair containing data', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" name=first; }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner name="Someone"/></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element with a name containing data', function() {
    var arrow = new Arrow('element "outer" @compact=true { element first; }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><Someone/></outer>';
    
    equal(actual, expected);
  });

  it('should remove an element containing nothing', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { last; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });

  it('should remove an element containing a string', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { "stuff"; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an element marked keep', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" @keep=true { "Boilerplate"; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner>Boilerplate</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should not remove attributes containing data', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "name" { first; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer name="Someone"/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an attributes with a name containing data', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute first { "etc"; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer Someone="etc"/>';
    
    equal(actual, expected);
  });
  
  it('should remove attributes containing nothing', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "name" { last; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should remove attributes containing a string', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "stuff" { "xyz"; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should not remove an attribute marked keep', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "stuff" @keep=true { "xyz"; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer stuff="xyz"/>';
    
    equal(actual, expected);
  });
  
  it('should keep an element if at least one child is marked as keep', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { element "etc"; element "stuff" @keep=true; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner><etc/><stuff/></inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should keep an element if at least one child is data', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { first; last; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner>Someone</inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should keep an attribute if at least one child is data', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "stuff" { first; last; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer stuff="Someone"/>';
    
    equal(actual, expected);
  });
  
  it('should propagate the keep flag through multiple layers', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { element "stuff" { element "etc" @keep=true; } } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer><inner><stuff><etc/></stuff></inner></outer>';
    
    equal(actual, expected);
  });
  
  it('should override @keep=true from a child if @keep=false', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" { element "stuff" @keep=false { element "etc" @keep=true; } } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should override elements containing data with @keep=false', function() {
    var arrow = new Arrow('element "outer" @compact=true { element "inner" @keep=false { first; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
  
  it('should override attributes containing data with @keep=false', function() {
    var arrow = new Arrow('element "outer" @compact=true { attribute "inner" @keep=false { first; } }', XML);
    
    var actual = arrow.evaluate({ first: 'Someone' }).render().toString();
    var expected = '<?xml version="1.0"?><outer/>';
    
    equal(actual, expected);
  });
});
