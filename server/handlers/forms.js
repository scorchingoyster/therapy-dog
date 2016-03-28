'use strict';

var Form = require('../models/form');
var FormNotFoundError = require('../errors').FormNotFoundError;

exports.index = function(req, res) {
  Form.findAll()
  .then(function(forms) {
    return Promise.all(forms.map(function(form) {
      return form.getResourceObject();
    }));
  })
  .then(function(data) {
    res.send({ data: data });
  })
  .catch(function(err) {
    console.error(err.stack);
    res.status(500).send({ errors: [{ title: 'Internal server error' }] });
  });
}

exports.show = function(req, res) {
  Form.findById(req.params.id)
  .then(function(form) {
    return form.getResourceObject();
  })
  .then(function(resourceObject) {
    res.send({ data: resourceObject });
  })
  .catch(function(err) {
    if (err instanceof FormNotFoundError) {
      res.status(404).send({ errors: [{ title: 'Form not found' }] })
    } else {
      console.error(err.stack);
      res.status(500).send({ errors: [{ title: 'Internal server error' }] });
    }
  });
}
