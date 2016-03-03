import Arrow from '../arrow';
import { XMLDocument, XMLElement, XMLAttribute } from './xml/model';

function parseHash(hash) {
  let options = {};
  let attributes = {};
  let data = false;
  
  Object.keys(hash).forEach((key) => {
    if (key[0] === "@") {
      options[key.slice(1)] = hash[key].value;
    } else {
      attributes[key] = hash[key].value;
    }

    data = data || hash[key].data;
  });
  
  return { attributes, options, data };
}

export default {
  attribute: Arrow.helper(function([name], hash, body) {
    let { options, data } = parseHash(hash);
    
    data = data || name.data;
    name = name.value;
    
    let children = body();
    data = data || children.data;
    
    if (options.compact) {
      children = children.value.filter((child) => {
        return children.data;
      });
    } else {
      children = children.value;
    }
    
    let keep;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data;
    }
    
    return { value: new XMLAttribute(name, children, keep), data: data };
  }, { raw: true }),
  
  element: Arrow.helper(function([name], hash, body) {
    let { attributes, options, data } = parseHash(hash);
    
    data = data || name.data;
    name = name.value;
    
    let children = body();
    data = data || children.data;
    
    if (options.compact) {
      children = children.value.filter((child) => {
        if (child instanceof XMLElement || child instanceof XMLAttribute) {
          return child.keep;
        } else {
          return children.data;
        }
      });
    } else {
      children = children.value;
    }
    
    let keep;
    if (typeof options.keep !== "undefined") {
      keep = options.keep;
    } else {
      keep = data || children.some(child => child.keep);
    }
    
    return { value: new XMLElement(name, attributes, children, keep), data: data };
  }, { raw: true }),
  
  document: Arrow.helper(function(params, hash, body) {
    return new XMLDocument(body()[0]);
  })
};
