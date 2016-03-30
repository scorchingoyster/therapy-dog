'use strict';

const Form = require('../models/form');
const FormNotFoundError = require('../lib/errors').FormNotFoundError;

exports.index = function(req, res, next) {
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
    next(err);
  });
};

exports.show = function(req, res, next) {
  Form.findById(req.params.id)
  .then(function(form) {
    return form.getResourceObject();
  })
  .then(function(resourceObject) {
    res.send({ data: resourceObject });
  })
  .catch(function(err) {
    if (err instanceof FormNotFoundError) {
      res.status(404).send({ errors: [{ title: 'Not found' }] });
    } else {
      next(err);
    }
  });
};
