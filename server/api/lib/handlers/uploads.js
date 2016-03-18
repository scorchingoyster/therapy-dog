var Upload = require('../models/upload');

exports.create = function(req, res) {
  Upload.createFromFile(req.file)
  .then(function(upload) {
    return upload.getResourceObject();
  })
  .then(function(data) {
    res.send({ data: data });
  })
  .catch(function(err) {
    console.error(err.stack);
    res.status(500).send({ errors: [{ title: "Internal server error" }] });
  });
}
