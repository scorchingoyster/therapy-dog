'use strict';

const Upload = require('../models/upload');

exports.create = function(req, res, next) {
  Upload.createFromFile(req.file)
  .then(function(upload) {
    return upload.getResourceObject();
  })
  .then(function(data) {
    res.send({ data: data });
  })
  .catch(function(err) {
    next(err);
  });
};
