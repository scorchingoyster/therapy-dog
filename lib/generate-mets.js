var xmlbuilder = require("xmlbuilder");

// metsHdr

function generateMetsHdr(mets, bundle) {
  var metsHdr =
  mets
    .element("metsHdr", { CREATEDATE: "2016-02-04T16:33:26-05:00" });

  metsHdr
    .element("agent", { ROLE: "CREATOR", TYPE: "OTHER" })
      .element("name")
        .text("CDR Forms");
}

// dmdSec

function collectMetadata(children) {
  var result = [];
  
  children.forEach(function(child) {
    if (child.type === "metadata") {
      result.push(child);
    }
    
    if (child.children) {
      result = result.concat(collectMetadata(child.children));
    }
  });
  
  return result;
}

function generateDmdSec(mets, form, bundle) {
  collectMetadata(bundle.children).forEach(function(metadata) {
    var dmdSec =
    mets
      .element("dmdSec", { ID: metadata.id });
    
    var xmlData =
    dmdSec
    .element("mdWrap", { MDTYPE: "MODS" })
      .element("xmlData");
    
    metadata.content[0].render(xmlData);
  });
}

// fileSec

function collectFiles(children) {
  var result = [];
  
  children.forEach(function(child) {
    if (child.type === "file") {
      result.push(child);
    }
    
    if (child.children) {
      result = result.concat(collectFiles(child.children));
    }
  });
  
  return result;
}

function generateFileSec(mets, bundle) {
  var fileGrp =
  mets
    .element("fileSec")
      .element("fileGrp", { ID: "OBJECTS" });

  collectFiles(bundle.children).forEach(function(file) {
    var upload = file.content[0];
    
    fileGrp
    .element("file", { CHECKSUM: upload.hash, CHECKSUMTYPE: "MD5", ID: file.id, MIMETYPE: upload.type, SIZE: upload.size })
      .element("FLocat", { "xlink:href": upload.id, LOCTYPE: "OTHER", USE: "STAGE" });
  });
}

// structMap

function generateItem(parent, node) {
  var div =
  parent
    .element("div", { ID: node.id });
  
  if (node.kind) {
    div.attribute("TYPE", node.kind);
  }
  
  if (node.label) {
    div.attribute("LABEL", node.label);
  }
  
  node.children.forEach(function(child) {
    if (child.type === "item") {
      generateItem(div, child);
    } else if (child.type === "file") {
      div.element("fptr", { FILEID: child.id });
    }
  });
  
  var metadataIds = node.children.filter(function(child) {
    return child.type === "metadata";
  }).map(function(metadata) {
    return metadata.id;
  });
  
  if (metadataIds.length > 0) {
    div.attribute("DMDID", metadataIds.join(" "));
  }
}

function generateStructMap(mets, bundle) {
  var structMap =
  mets
    .element("structMap");

  bundle.children.forEach(function(node) {
    if (node.type === "item") {
      generateItem(structMap, node);
    }
  });
}

// structLink

function multimapPut(m, key, value) {
  if (!m.hasOwnProperty(key)) {
    m[key] = [];
  }
  m[key].push(value);
}

function multimapMerge(m1, m2) {
  Object.keys(m2).forEach(function(key) {
    if (m1.hasOwnProperty(key)) {
      m1[key] = m1[key].concat(m2[key]);
    } else {
      m1[key] = m2[key];
    }
  });
}

function collectItemsByFragment(nodes) {
  var result = {};
  
  nodes.forEach(function(node) {
    if (node.type === "item" && node.fragment) {
      multimapPut(result, node.fragment, node);
    }
    
    if (node.children) {
      multimapMerge(result, collectItemsByFragment(node.children));
    }
  });
  
  return result;
}

function collectItemsAndLinks(nodes) {
  var result = [];

  nodes.forEach(function(node) {
    if (node.type === "item") {
      if (node.children) {
        node.children.forEach(function(child) {
          if (child.type === 'link') {
            result.push({ item: node, link: child });
          }
        });

        result = result.concat(collectItemsAndLinks(node.children));
      }
    }
  });

  return result;
}

function collectSmLinks(nodes) {
  var itemsByFragment = collectItemsByFragment(nodes);
  var itemsAndLinks = collectItemsAndLinks(nodes);

  var result = [];

  itemsAndLinks.forEach(function(pair) {
    var link = pair.link;
    var item = pair.item;

    if (pair.link.href[0] === "#") {
      var targets = itemsByFragment[pair.link.href.slice(1)];

      return targets.map(function(target) {
        result.push({ arcrole: link.rel, from: "#" + item.id, to: "#" + target.id });
      });
    } else {
      result.push({ arcrole: link.rel, from: "#" + item.id, to: link.href });
    }
  });

  return result;
}

function generateStructLink(mets, bundle) {
  var smLinks = collectSmLinks(bundle.children);
  
  if (smLinks.length > 0) {
    var structMap =
    mets
      .element("structLink");

    smLinks.forEach(function(link) {
      structMap.element("smLink", { "xlink:arcrole": link.arcrole, "xlink:from": link.from, "xlink:to": link.to });
    });
  }
}

// mets

function generateMets(form, bundle) {
  var mets = xmlbuilder.create('mets')
    .attribute("xmlns", "http://www.loc.gov/METS/")
    .attribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .attribute("PROFILE", "http://cdr.unc.edu/METS/profiles/Simple")
  
  generateMetsHdr(mets, bundle);
  generateDmdSec(mets, form, bundle);
  generateFileSec(mets, bundle);
  generateStructMap(mets, bundle);
  generateStructLink(mets, bundle);
  
  return mets.end({ pretty: true });
}

module.exports = generateMets;
