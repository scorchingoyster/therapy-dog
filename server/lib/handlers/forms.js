'use strict';

const Form = require('../models/form');
const FormNotFoundError = require('../errors').FormNotFoundError;

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
    if (req.remoteUser) {
      return form.getResourceObject({ children: true });
    } else {
      return form.getResourceObject();
    }
  })
  .then(function(resourceObject) {
    let meta = {};

    if (req.remoteUser) {
      meta.authorized = true;
    } else {
      meta.authorized = false;
    }

    if (req.headers['mail']) {
      meta.mail = req.headers['mail'];
    }

    res.send({
      data: resourceObject,
      meta: meta
    });
  })
  .catch(function(err) {
    if (err instanceof FormNotFoundError) {
      res.status(404).send({ errors: [{ status: '404', title: 'Not found' }] });
    } else {
      next(err);
    }
  });
};
