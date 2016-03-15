import fs from 'fs';
import tmp from 'tmp';
import uuid from 'uuid';
import Upload from 'api/models/upload';

export function buildTestUpload(name, type, buffer) {
  var tmpobj = tmp.fileSync();
  fs.writeSync(tmpobj.fd, buffer, 0, buffer.length);
  
  return new Upload(uuid.v4(), {
    name: name,
    type: type,
    path: tmpobj.name,
    size: buffer.length
  });
}
