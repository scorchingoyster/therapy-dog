'use strict';

exports.requireRemoteUser = function(req, res, next) {
  let user = req.headers['remote_user'];

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401);
    res.header('Cache-Control', 'max-age=0');
    res.send({ errors: [{ status: '401', title: 'Unauthorized' }] });
  }
};
