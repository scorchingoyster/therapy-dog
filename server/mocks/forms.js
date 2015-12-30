var glob = require("glob");
var path = require("path");

var forms = {};

glob(__dirname + "/forms/*.json", function(err, filenames) {
  filenames.forEach(function(filename) {
    var id = path.basename(filename, ".json");
    forms[id] = require(filename);
  })
});

/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var formsRouter = express.Router();
  
  formsRouter.get('/', function(req, res) {
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

  formsRouter.get('/:id', function(req, res) {
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

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/forms', require('body-parser').json());
  app.use('/api/forms', formsRouter);
};
