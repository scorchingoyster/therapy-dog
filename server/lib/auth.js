'use strict';

exports.requireRemoteUser = function(req, res, next) {
  let user = req.headers['remote_user'];

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401);
    res.send({ errors: [{ status: '401', title: 'Unauthorized' }] });
  }
};
