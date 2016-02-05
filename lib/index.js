/*jshint node:true*/
var glob = require('glob');
var path = require('path');
var generateBundle = require("./generate-bundle");
var generateMets = require("./generate-mets");
var generateZip = require("./generate-zip");
var submitZip = require("./submit-zip");

var forms = {};
glob('forms/*.json', { realpath: true }, function(err, files) {
  files.forEach(function(file) {
    forms[path.basename(file, '.json')] = require(file);
  });
});

function getForm(deposit) {
  if (forms.hasOwnProperty(deposit.form)) {
    return forms[deposit.form];
  }
}

module.exports = function(app) {
  var express = require('express');
  var multer = require('multer')
  
  var upload = multer({ dest: 'uploads/' });
  var router = express.Router();

  router.post('/deposit', function(req, res) {
    var deposit = req.body;
    var form = forms[deposit.form];
    var values = deposit.values;
    var bundle = generateBundle(form, values);
    var mets = generateMets(form, bundle);
    
    generateZip(form, bundle, mets)
    .then(function(zip) {
      return submitZip(form, zip);
    })
    .then(function(result) {
      res.send(result).end();
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500).end();
    });
  });
  
  router.post('/uploads', upload.single('file'), function(req, res) {
    res.send({
      id: req.file.filename,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });
  });

  app.use('/', require('body-parser').json());
  app.use('/', router);
};
