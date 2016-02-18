var archiver = require('archiver');
var Promise = require('promise');
var tmp = require('tmp');
var fs = require('fs');

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

function generateZip(form, bundle, mets) {
  var uploads = collectFiles(bundle.children).map(function(file) {
    return file.content[0];
  });
  
  return new Promise(function(resolve, reject) {
    tmp.tmpName(function(err, name) {
      if (err) {
        reject(err);
        return;
      }
    
      var output = fs.createWriteStream(name);

      output.on('close', function() {
        resolve(name);
      });

      var archive = archiver.create('zip', {});
      archive.pipe(output);

      archive.on('error', function(err) {
        reject(err);
      });

      archive.append(new Buffer(mets, 'utf8'), { prefix: '', name: 'mets.xml' });

      uploads.forEach(function(upload) {
        archive.append(fs.createReadStream(upload.path), { name: upload.id });
      });

      archive.finalize();
    });
  });
}

module.exports = generateZip;
