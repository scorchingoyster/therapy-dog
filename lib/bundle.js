var unwrapData = require('./arrow/utils').unwrapData;
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

function Bundle(children) {
  // var itemsByFragment = collectItemsByFragment(children);
  // var linksByHref = collectLinksByHref(children);
  //
  // Object.keys(itemsByFragment).forEach(function(fragment) {
  //   var item = itemsByFragment[fragment];
  //
  //   if (linksByHref.hasOwnProperty("#" + fragment)) {
  //     linksByHref["#" + fragment].forEach(function(link) {
  //       link.items = item;
  //     });
  //   }
  // });
  
  this.type = "bundle";
  this.children = children;
}

Bundle.helpers = {
  item: function(params, hash, context, content) {
    return {
      type: "item",
      id: "_" + uuid.v4(),
      kind: unwrapData(hash.kind),
      label: unwrapData(hash.label),
      fragment: unwrapData(hash.fragment),
      children: content.body()
    };
  },

  file: function(params, hash, context, content) {
    return {
      type: "file",
      id: "_" + uuid.v4(),
      content: unwrapData(hash.content)
    }
  },

  link: function(params, hash, context, content) {
    return {
      type: "link",
      rel: unwrapData(hash.rel),
      href: unwrapData(hash.href)
    }
  },

  metadata: function(params, hash, context, content) {
    var data;
    
    if (hash.hasOwnProperty('data')) {
      data = unwrapData(hash.data);
    } else {
      data = {};
      Object.keys(context).forEach(function(key) {
        data[key] = unwrapData(context[key]);
      });
    }
    
    return {
      type: "metadata",
      id: "_" + uuid.v4(),
      template: unwrapData(hash.template),
      data: data
    }
  }
};

module.exports = Bundle;
