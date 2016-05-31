'use strict';

const Form = require('../models/form');
const config = require('../../config');
const ModelNotFoundError = require('../errors').ModelNotFoundError;

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

    if (config.DEBUG) {
      meta.debug = true;
    }

    if (req.remoteUser) {
      meta.authorized = true;
    } else {
      meta.authorized = false;
    }

    if (req.headers['mail']) {
      meta.mail = req.headers['mail'];
    }

    res.header('Content-Type', 'application/vnd.api+json');
    res.send(new Buffer(JSON.stringify({
      data: resourceObject,
      meta: meta
    })));
  })
  .catch(function(err) {
    if (err instanceof ModelNotFoundError || err instanceof SyntaxError || err instanceof TypeError) {
      res.status(404);
      res.header('Content-Type', 'application/vnd.api+json');
      res.send(new Buffer(JSON.stringify({ errors: [{ status: '404', title: 'Not found' }] })));
    } else {
      next(err);
    }
  });
};
