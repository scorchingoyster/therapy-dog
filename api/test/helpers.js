import fs from 'fs';
import tmp from 'tmp';
import Upload from 'api/upload';

export function buildTestUpload(name, type, buffer) {
  var tmpobj = tmp.fileSync();
  fs.writeSync(tmpobj.fd, buffer, 0, buffer.length);
  
  return new Upload({
    id: "abc",
    name: name,
    type: type,
    path: tmpobj.name,
    size: buffer.length
  });
}
