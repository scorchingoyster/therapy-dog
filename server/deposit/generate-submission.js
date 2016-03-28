'use strict';

var crypto = require('crypto');
var fs = require('fs');
var Xmlbuilder = require('xmlbuilder');
var Promise = require('promise');
var Link = require('../bundle/model').Link;
var Item = require('../bundle/model').Item;
var File = require('../bundle/model').File;
var Metadata = require('../bundle/model').Metadata;

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

function generateDmdSec(mets, bundle) {
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

function generateFileSec(mets, bundle, locations, checksums) {
  var fileGrp =
  mets
    .element("fileSec")
      .element("fileGrp", { ID: "OBJECTS" });

  bundle.files.forEach(function(file) {
    fileGrp
      .element("file", { CHECKSUM: checksums[file.id], CHECKSUMTYPE: "MD5", ID: file.id, MIMETYPE: file.mimetype, SIZE: file.size })
        .element("FLocat", { "xlink:href": locations[file.id], LOCTYPE: "OTHER", USE: "STAGE" });
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

  var admIds = metadata.filter(function(node) {
    return node.type === "access-control";
  }).map(function(node) {
    return node.id;
  });

  if (dmdIds.length > 0) {
    div.attribute("DMDID", dmdIds.join(" "));
  }

  if (admIds.length > 0) {
    div.attribute("ADMID", admIds.join(" "));
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

module.exports = function(form, bundle) {
  // Build a hash of file locations (just the file id right now) by file id.
  // This is where we'd assign staging URLs if we wanted to refer to files outside of the submission proper.
  var fileLocations = bundle.files.reduce(function(obj, file) {
    obj[file.id] = file.id;
    return obj;
  }, {});
  
  // Build an array of promises which calculate the checksum for each file.
  var checksums = bundle.files.map(function(file) {
    return file.getHashDigest('md5', 'hex');
  });
  
  // Calculate all of the checksums, and then proceed with generating METS.
  return Promise.all(checksums)
  .then(function(checksums) {
    // Build a hash of checksums by file id.
    var fileChecksums = bundle.files.reduce(function(obj, file, index) {
      obj[file.id] = checksums[index];
      return obj;
    }, {});
    
    var mets = Xmlbuilder.create('mets')
      .attribute("xmlns", "http://www.loc.gov/METS/")
      .attribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attribute("PROFILE", "http://cdr.unc.edu/METS/profiles/Simple");
  
    generateMetsHdr(mets, bundle);
    generateDmdSec(mets, bundle);
    generateAmdSec(mets, bundle);
    generateFileSec(mets, bundle, fileLocations, fileChecksums);
    generateStructMap(mets, bundle);
    generateStructLink(mets, bundle);
  
    // Build the submission. The name of the METS XML will be "mets.xml", and the rest of the files will be named by their ID.
    var submission = {
      "mets.xml": new Buffer(mets.end({ pretty: true }))
    };
  
    bundle.files.forEach(function(file) {
      if (file.isUpload) {
        submission[file.id] = file.contents.path;
      } else {
        submission[file.id] = file.contents;
      }
    });
  
    return submission;
  });
};
