var Arrow = require('arrow-templates');
var uuid = require('uuid');

// moved to generate-mets...

// function multimapPut(m, key, value) {
//   if (!m.hasOwnProperty(key)) {
//     m[key] = [];
//   }
//   m[key].push(value);
// }
//
// function multimapMerge(m1, m2) {
//   Object.keys(m2).forEach(function(key) {
//     if (m1.hasOwnProperty(key)) {
//       m1[key] = m1[key].concat(m2[key]);
//     } else {
//       m1[key] = m2[key];
//     }
//   });
// }
//
// function collectItemsByFragment(nodes) {
//   var result = {};
//
//   nodes.forEach(function(node) {
//     if (node.type === "item" && node.fragment) {
//       multimapPut(result, node.fragment, node);
//     }
//
//     if (node.children) {
//       multimapMerge(result, collectItemsByFragment(node.children));
//     }
//   });
//
//   return result;
// }
//
// function collectLinksByHref(nodes) {
//   var result = {};
//
//   nodes.forEach(function(node) {
//     if (node.type === "link" && node.href) {
//       multimapPut(result, node.href, node);
//     }
//
//     if (node.children) {
//       multimapMerge(result, collectLinksByHref(node.children));
//     }
//   });
//
//   return result;
// }

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
