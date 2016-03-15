var Form = require('../models/form');

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
    res.send({ errors: [{ detail: err.message }] });
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
    console.error(err.stack);
    res.status(500).send({ errors: [{ detail: err.message }] });
  });
}
