import Arrow from 'arrow';
var uuid = require('uuid');

module.exports = {
  item: Arrow.helper(function(params, hash, body) {
    return {
      type: "item",
      id: "_" + uuid.v4(),
      kind: hash.kind,
      label: hash.label,
      fragment: hash.fragment,
      children: body()
    };
  }),

  file: Arrow.helper(function(params, hash, body) {
    return {
      type: "file",
      id: "_" + uuid.v4(),
      content: body()
    }
  }),

  link: Arrow.helper(function(params, hash, body) {
    return {
      type: "link",
      rel: hash.rel,
      href: hash.href
    }
  }),

  metadata: Arrow.helper(function(params, hash, body) {
    return {
      type: "metadata",
      kind: hash.kind,
      id: "_" + uuid.v4(),
      content: body()
    }
  }),
  
  document: Arrow.helper(function(params, hash, body) {
    return {
      type: "bundle",
      children: body()
    };
  })
};
