import xmlbuilder from 'xmlbuilder';
import { Link, Item, File, Metadata } from './bundle/model';

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

function generateDmdSec(mets, form, bundle) {
  bundle.metadata.forEach(function(metadata) {
    if (metadata.type === "descriptive") {
      var dmdSec =
      mets
        .element("dmdSec", { ID: metadata.id });

      var xmlData =
      dmdSec
        .element("mdWrap", { MDTYPE: "MODS" })
          .element("xmlData");

      metadata.contents.render(xmlData);
    }
  });
}

// amdSec

function generateAmdSec(mets, bundle) {
  var metadata = bundle.metadata.filter(function(node) {
    return node.type === "access-control";
  });
  
  if (metadata.length > 0) {
    var amdSec =
    mets
      .element("amdSec");
    
    metadata.forEach(function(node) {
      var rights =
      amdSec
        .element("rightsMD", { ID: node.id });
      
      var xmlData =
      rights
        .element("mdWrap", { MDTYPE: "OTHER" })
          .element("xmlData");
      
      node.contents.render(xmlData);
    });
  }
}

// fileSec

function generateFileSec(mets, bundle) {
  var fileGrp =
  mets
    .element("fileSec")
      .element("fileGrp", { ID: "OBJECTS" });

  bundle.files.forEach(function(file) {
    fileGrp
      .element("file", { CHECKSUM: "fakechecksum", CHECKSUMTYPE: "MD5", ID: file.id, MIMETYPE: file.mimetype, SIZE: file.size })
        .element("FLocat", { "xlink:href": file.id, LOCTYPE: "OTHER", USE: "STAGE" });
  });
}

// structMap

function generateItem(parent, node) {
  var div =
  parent
    .element("div", { ID: node.id });
  
  if (node.type) {
    div.attribute("TYPE", node.type);
  }
  
  if (node.label) {
    div.attribute("LABEL", node.label);
  }
  
  node.children.forEach(function(child) {
    if (child instanceof Item) {
      generateItem(div, child);
    } else if (child instanceof File) {
      div.element("fptr", { FILEID: child.id });
    }
  });

  var metadata = node.children.filter(function(child) {
    return child instanceof Metadata;
  });

  var dmdIds = metadata.filter(function(node) {
    return node.type === "descriptive";
  }).map(function(node) {
    return node.id;
  });

  var amdIds = metadata.filter(function(node) {
    return node.type === "access-control";
  }).map(function(node) {
    return node.id;
  });

  if (dmdIds.length > 0) {
    div.attribute("DMDID", dmdIds.join(" "));
  }

  if (amdIds.length > 0) {
    div.attribute("AMDID", amdIds.join(" "));
  }
}

function generateStructMap(mets, bundle) {
  var structMap =
  mets
    .element("structMap");

  bundle.children.forEach(function(child) {
    generateItem(structMap, child);
  });
}

// structLink

function collectSmLinks(bundle) {
  var result = [];
  
  bundle.items.forEach(function(item) {
    item.children.forEach(function(child) {
      if (child instanceof Link) {
        if (child.items) {
          child.items.map(function(target) {
            result.push({ arcrole: child.rel, from: "#" + item.id, to: "#" + target.id });
          });
        } else {
          result.push({ arcrole: child.rel, from: "#" + item.id, to: child.href });
        }
      }
    });
  });

  return result;
}

function generateStructLink(mets, bundle) {
  var smLinks = collectSmLinks(bundle);
  
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

export default function generateMets(form, bundle) {
  var mets = xmlbuilder.create('mets')
    .attribute("xmlns", "http://www.loc.gov/METS/")
    .attribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
    .attribute("PROFILE", "http://cdr.unc.edu/METS/profiles/Simple");
  
  generateMetsHdr(mets, bundle);
  generateDmdSec(mets, form, bundle);
  generateAmdSec(mets, bundle);
  generateFileSec(mets, bundle);
  generateStructMap(mets, bundle);
  generateStructLink(mets, bundle);
  
  return mets.end({ pretty: true });
}
