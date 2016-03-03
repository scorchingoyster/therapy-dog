import Xmlbuilder from 'xmlbuilder';

function renderElement(builder, attributes, children) {
  Object.keys(attributes).forEach((name) => {
    builder.attribute(name, attributes[name]);
  });
  
  children.forEach((child) => {
    if (child instanceof XMLElement || child instanceof XMLAttribute) {
      child.render(builder);
    } else {
      builder.text(String(child));
    }
  });
}

export class XMLAttribute {
  constructor(name, children, keep) {
    this.name = name;
    this.children = children;
    this.keep = keep;
  }
  
  render(builder) {
    var value = "";
    
    this.children.forEach((child) => {
      value += String(child);
    });
    
    builder.attribute(this.name, value);
  }
}

export class XMLElement {
  constructor(name, attributes, children, keep) {
    this.name = name;
    this.attributes = attributes;
    this.children = children;
    this.keep = keep;
  }
  
  render(builder) {
    let element = builder.element(this.name);
    renderElement(element, this.attributes, this.children);
  }
}

export class XMLDocument {
  constructor(root) {
    this.root = root;
  }
  
  render(builder) {
    if (typeof builder === 'undefined') {
      let builder = Xmlbuilder.create(this.root.name);
      renderElement(builder, this.root.attributes, this.root.children);
      return builder.doc();
    } else {
      let element = builder.element(this.root.name);
      renderElement(element, this.root.attributes, this.root.children);
    }
  }
}
