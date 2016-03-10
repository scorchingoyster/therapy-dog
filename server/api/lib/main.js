/*jshint node:true*/
var glob = require('glob');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var inspect = require('util').inspect;
var Promise = require('promise');
var generateBundle = require("./generate-bundle");
var generateSubmission = require("./generate-submission");
var submitZip = require("./submit-zip");
var Upload = require("./upload");

var forms = {};
glob(__dirname + "/../forms/*.json", function(err, filenames) {
  filenames.forEach(function(filename) {
    try {
      var id = path.basename(filename, ".json");
      forms[id] = require(filename);
    } catch (err) {
      console.error(err);
    }
  })
});

function getForm(id) {
  if (forms.hasOwnProperty(id)) {
    return forms[id];
  }
}

var uploads = {};

function getUpload(id) {
  if (uploads.hasOwnProperty(id)) {
    return uploads[id];
  }
}

function getValues(blocks, values) {
  var result = {};
  
  blocks.forEach(function(block) {
    var key = block.key;
    var value = values[key];
    
    if (typeof value === 'undefined') {
      return;
    }
    
    if (block.type === "text") {
      result[key] = String(value);
    } else if (block.type === "date") {
      result[key] = String(value);
    } else if (block.type === "select") {
      result[key] = value;
    } else if (block.type === "checkboxes") {
      result[key] = value;
    } else if (block.type === "radio") {
      result[key] = value;
    } else if (block.type === "file") {
      // FIXME: we'd prefer to accept just an id.
      result[key] = getUpload(value.id);
    } else if (block.type === "section") {
      if (block.repeat) {
        result[key] = value.map(function(item) {
          return getValues(block.children, item);
        });
      } else {
        result[key] = getValues(block.children, value);
      }
    }
  });
  
  return result;
}

module.exports = function(app, config) {
  var express = require('express');
  var multer = require('multer');
  
  var upload = multer({ dest: config.uploadsDirectory });
  var router = express.Router();
  
  router.get('/forms', function(req, res) {
    var data = [];
    var id;
    
    for (id in forms) {
      if (forms.hasOwnProperty(id)) {
        data.push({
          'type': 'form',
          'id': id,
          'attributes': forms[id]
        });
      }
    }
    
    res.send({
      'data': data
    });
  });

  router.get('/forms/:id', function(req, res) {
    var attributes = forms[req.params.id];
    
    if (attributes) {
      res.send({
        'data': {
          'type': 'form',
          'id': req.params.id,
          'attributes': attributes
        }
      });
    } else {
      res.status(404).end();
    }
  });

  router.post('/deposit', function(req, res) {
    var deposit = req.body;
    var form = getForm(deposit.form);
    
    var values = getValues(form.children, deposit.values);
    console.log(inspect(values, { depth: null }));
    
    var bundle = generateBundle(form, values);
    console.log(inspect(bundle, { depth: null }));
    
    generateSubmission(form, bundle)
    .then(function(submission) {
      Object.keys(submission).forEach(function(name) {
        if (submission[name] instanceof Buffer) {
          console.log(name, submission[name].toString());
        } else {
          console.log(name, submission[name]);
        }
      });
      
      return submitZip(form, submission, {
        baseUrl: config.depositBaseUrl,
        username: config.depositUsername,
        password: config.depositPassword
      });
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
    var upload = new Upload({
      id: req.file.filename,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    uploads[upload.id] = upload;

    res.send({
      id: upload.id,
      name: upload.name,
      type: upload.type,
      size: upload.size
    });
  });

  app.use('/', require('body-parser').json());
  app.use('/', router);
};
