var fs = require('fs');
var tmp = require('tmp');
var uuid = require('uuid');
var Upload = require('../../models/upload');

module.exports.buildTestUpload = function(name, type, buffer) {
  var tmpobj = tmp.fileSync();
  fs.writeSync(tmpobj.fd, buffer, 0, buffer.length);
  
  return new Upload(uuid.v4(), {
    name: name,
    type: type,
    path: tmpobj.name,
    size: buffer.length
  });
}
