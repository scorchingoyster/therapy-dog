// Copyright 2017 The University of North Carolina at Chapel Hill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const fs = require('fs');
const tmp = require('tmp');
const uuid = require('uuid');
const Upload = require('../lib/models/upload');

exports.buildTestUpload = function(name, type, buffer) {
  let tmpobj = tmp.fileSync();
  fs.writeSync(tmpobj.fd, buffer, 0, buffer.length);

  return new Upload(uuid.v4(), {
    name: name,
    type: type,
    path: tmpobj.name,
    size: buffer.length
  });
};

exports.createTestUpload = function(name, type, buffer) {
  let tmpobj = tmp.fileSync();
  fs.writeSync(tmpobj.fd, buffer, 0, buffer.length);

  return Upload.createFromFile({
    filename: uuid.v4(),
    originalname: name,
    mimetype: type,
    path: tmpobj.name,
    size: buffer.length
  });
};
